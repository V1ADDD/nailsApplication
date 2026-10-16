using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Chats.Contracts;
using Nails.Infrastructure.Modules.Chats.Entities;
using Nails.Infrastructure.Modules.Chats.Models;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Chats.Repositories;

public sealed class MessageRepository(AppDbContext dbContext) : IMessageRepository
{
    private DbSet<Message> Messages => dbContext.Set<Message>();

    public void Add(Message message) => Messages.Add(message);

    public Task<Message?> FindAsync(Guid messageId, CancellationToken cancellationToken) =>
        Messages.FirstOrDefaultAsync(message => message.Id == messageId, cancellationToken);

    public async Task<IReadOnlyList<Message>> NewestAsync(
        Guid chatId,
        DateTimeOffset? after,
        Guid? before,
        int take,
        CancellationToken cancellationToken)
    {
        var messages = Messages.AsNoTracking().Where(message => message.ChatId == chatId);

        if (after is { } clearedAt)
        {
            messages = messages.Where(message => message.SentAt > clearedAt);
        }

        if (before is { } beforeId
            && await Messages.AsNoTracking()
                .Where(message => message.Id == beforeId && message.ChatId == chatId)
                .Select(message => (DateTimeOffset?)message.SentAt)
                .FirstOrDefaultAsync(cancellationToken) is { } beforeAt)
        {
            messages = messages.Where(message => message.SentAt < beforeAt);
        }

        return await messages
            .OrderByDescending(message => message.SentAt)
            .ThenByDescending(message => message.Id)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Guid>> BookingIdsAsync(Guid chatId, DateTimeOffset? after, CancellationToken cancellationToken) =>
        await Messages.AsNoTracking()
            .Where(message => message.ChatId == chatId
                && message.BookingId != null
                && (after == null || message.SentAt > after))
            .Select(message => message.BookingId!.Value)
            .Distinct()
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ReplyMessageRow>> ReplyMessagesAsync(
        Guid masterId,
        DateTimeOffset since,
        CancellationToken cancellationToken) =>
        await (
                from message in Messages.AsNoTracking()
                join chat in dbContext.Set<Chat>().AsNoTracking() on message.ChatId equals chat.Id
                where chat.MasterId == masterId
                    && message.Kind != MessageKind.System
                    && message.AuthorRole != null
                    && message.SentAt >= since
                orderby message.ChatId, message.SentAt
                select new ReplyMessageRow(message.ChatId, message.AuthorRole!.Value, message.SentAt))
            .ToListAsync(cancellationToken);
}
