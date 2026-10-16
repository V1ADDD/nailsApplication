using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Chats.Contracts;
using Nails.Infrastructure.Modules.Chats.Entities;
using Nails.Infrastructure.Modules.Chats.Models;
using Nails.Infrastructure.Persistence;
using Npgsql;

namespace Nails.Infrastructure.Modules.Chats.Repositories;

public sealed class ChatRepository(AppDbContext dbContext) : IChatRepository
{
    private DbSet<Chat> Chats => dbContext.Set<Chat>();

    private DbSet<Message> Messages => dbContext.Set<Message>();

    public Task<Chat?> FindAsync(Guid chatId, CancellationToken cancellationToken) =>
        Chats.FirstOrDefaultAsync(chat => chat.Id == chatId, cancellationToken);

    public async Task<Chat> EnsurePairAsync(Guid masterId, Guid clientUserId, DateTimeOffset now, CancellationToken cancellationToken)
    {
        if (await FindPairAsync(masterId, clientUserId, cancellationToken) is { } existing)
        {
            return existing;
        }

        var chat = new Chat
        {
            Id = Guid.CreateVersion7(),
            MasterId = masterId,
            ClientUserId = clientUserId,
            ClientReadAt = now,
            MasterReadAt = now
        };
        Chats.Add(chat);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return chat;
        }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            dbContext.Entry(chat).State = EntityState.Detached;
            return await FindPairAsync(masterId, clientUserId, cancellationToken)
                ?? throw new InvalidOperationException("The chat of the pair disappeared after a duplicate insert.");
        }
    }

    public async Task<IReadOnlyList<ChatListRow>> ListAsync(ChatRole role, Guid sideId, CancellationToken cancellationToken)
    {
        var chats = Chats.AsNoTracking();
        var rows = role == ChatRole.Client
            ? chats
                .Where(chat => chat.ClientUserId == sideId && !chat.ClientHidden)
                .Select(chat => new ChatListRow
                {
                    Chat = chat,
                    LastMessage = Messages
                        .Where(message => message.ChatId == chat.Id
                            && (chat.ClientClearedAt == null || message.SentAt > chat.ClientClearedAt))
                        .OrderByDescending(message => message.SentAt)
                        .ThenByDescending(message => message.Id)
                        .FirstOrDefault()
                })
            : chats
                .Where(chat => chat.MasterId == sideId && !chat.MasterHidden)
                .Select(chat => new ChatListRow
                {
                    Chat = chat,
                    LastMessage = Messages
                        .Where(message => message.ChatId == chat.Id
                            && (chat.MasterClearedAt == null || message.SentAt > chat.MasterClearedAt))
                        .OrderByDescending(message => message.SentAt)
                        .ThenByDescending(message => message.Id)
                        .FirstOrDefault()
                });

        return await rows
            .OrderByDescending(row => row.Chat.LastMessageAt ?? row.Chat.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyDictionary<Guid, int>> UnreadAsync(ChatRole role, Guid sideId, CancellationToken cancellationToken) =>
        await (
                from message in Messages.AsNoTracking()
                join side in Sides(role, sideId) on message.ChatId equals side.ChatId
                where message.Kind != MessageKind.System
                    && message.DeletedAt == null
                    && message.AuthorRole != role
                    && message.SentAt > side.ReadAt
                    && (side.ClearedAt == null || message.SentAt > side.ClearedAt)
                group message by message.ChatId into chat
                select new { ChatId = chat.Key, Count = chat.Count() })
            .ToDictionaryAsync(row => row.ChatId, row => row.Count, cancellationToken);

    public Task MarkReadAsync(Guid chatId, ChatRole role, DateTimeOffset at, CancellationToken cancellationToken) =>
        role == ChatRole.Client
            ? Chats.Where(chat => chat.Id == chatId && chat.ClientReadAt < at)
                .ExecuteUpdateAsync(setters => setters.SetProperty(chat => chat.ClientReadAt, at), cancellationToken)
            : Chats.Where(chat => chat.Id == chatId && chat.MasterReadAt < at)
                .ExecuteUpdateAsync(setters => setters.SetProperty(chat => chat.MasterReadAt, at), cancellationToken);

    public Task ClearAsync(Guid chatId, ChatRole role, DateTimeOffset at, CancellationToken cancellationToken) =>
        role == ChatRole.Client
            ? Chats.Where(chat => chat.Id == chatId).ExecuteUpdateAsync(
                setters => setters.SetProperty(chat => chat.ClientClearedAt, at).SetProperty(chat => chat.ClientHidden, true),
                cancellationToken)
            : Chats.Where(chat => chat.Id == chatId).ExecuteUpdateAsync(
                setters => setters.SetProperty(chat => chat.MasterClearedAt, at).SetProperty(chat => chat.MasterHidden, true),
                cancellationToken);

    public Task ShowAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken) =>
        role == ChatRole.Client
            ? Chats.Where(chat => chat.Id == chatId)
                .ExecuteUpdateAsync(setters => setters.SetProperty(chat => chat.ClientHidden, false), cancellationToken)
            : Chats.Where(chat => chat.Id == chatId)
                .ExecuteUpdateAsync(setters => setters.SetProperty(chat => chat.MasterHidden, false), cancellationToken);

    public Task TouchAsync(Guid chatId, DateTimeOffset at, CancellationToken cancellationToken) =>
        Chats.Where(chat => chat.Id == chatId).ExecuteUpdateAsync(
            setters => setters
                .SetProperty(chat => chat.LastMessageAt, chat => chat.LastMessageAt == null || chat.LastMessageAt < at ? at : chat.LastMessageAt)
                .SetProperty(chat => chat.ClientHidden, false)
                .SetProperty(chat => chat.MasterHidden, false),
            cancellationToken);

    public async Task<bool> SaveAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            foreach (var entry in dbContext.ChangeTracker.Entries<Chat>().Where(entry => entry.State != EntityState.Unchanged).ToList())
            {
                entry.State = EntityState.Detached;
            }

            return false;
        }
    }

    public Task<Chat?> FindPairAsync(Guid masterId, Guid clientUserId, CancellationToken cancellationToken) =>
        Chats.FirstOrDefaultAsync(chat => chat.MasterId == masterId && chat.ClientUserId == clientUserId, cancellationToken);

    private IQueryable<ChatSide> Sides(ChatRole role, Guid sideId) =>
        role == ChatRole.Client
            ? Chats.AsNoTracking().Where(chat => chat.ClientUserId == sideId).Select(chat => new ChatSide
            {
                ChatId = chat.Id,
                ReadAt = chat.ClientReadAt,
                ClearedAt = chat.ClientClearedAt
            })
            : Chats.AsNoTracking().Where(chat => chat.MasterId == sideId).Select(chat => new ChatSide
            {
                ChatId = chat.Id,
                ReadAt = chat.MasterReadAt,
                ClearedAt = chat.MasterClearedAt
            });
}
