using Microsoft.Extensions.Options;
using Nails.Application.Modules.Chats.Contracts;
using Nails.Application.Modules.Chats.Options;
using Nails.Application.Modules.Chats.Requests;
using Nails.Application.Modules.Chats.Responses;
using Nails.Application.Modules.Chats.Rules;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Chats.Contracts;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Services;

public sealed class ChatService(
    IChatAccess access,
    IChatRepository chats,
    IMessageRepository messages,
    IMasterDirectory masters,
    ChatViews views,
    ChatEvents events,
    TimeProvider clock,
    IOptions<ChatMessagesOptions> options) : IChatService
{
    public async Task<StartChatResponse> StartAsync(StartChatRequest request, CancellationToken cancellationToken)
    {
        var (masterId, clientUserId, role) = request switch
        {
            { MasterId: { } master, ClientId: null } => (master, access.UserId, ChatRole.Client),
            { MasterId: null, ClientId: { } client } => (await access.SideIdAsync(ChatRole.Master, cancellationToken), client, ChatRole.Master),
            _ => throw ChatsErrors.StartTarget()
        };

        if (role == ChatRole.Client)
        {
            var summary = (await masters.MastersAsync([masterId], cancellationToken)).GetValueOrDefault(masterId);

            if (summary is null || summary.Deleted)
            {
                throw ChatsErrors.MasterNotFound();
            }

            if (summary.UserId == access.UserId)
            {
                throw ChatsErrors.SelfChat();
            }
        }
        else if (!(await masters.ClientsWithBookingsAsync(masterId, [clientUserId], cancellationToken)).Contains(clientUserId))
        {
            throw ChatsErrors.NotOwnClient();
        }

        var chat = await chats.EnsurePairAsync(masterId, clientUserId, clock.GetUtcNow(), cancellationToken);
        await chats.ShowAsync(chat.Id, role, cancellationToken);

        return new StartChatResponse(chat.Id);
    }

    public async Task<IReadOnlyList<ChatSummaryResponse>> ListAsync(ChatRole role, CancellationToken cancellationToken)
    {
        var sideId = await access.SideIdAsync(role, cancellationToken);
        var rows = await chats.ListAsync(role, sideId, cancellationToken);
        var unread = await chats.UnreadAsync(role, sideId, cancellationToken);
        var counterparts = await views.CounterpartsAsync(role, [.. rows.Select(row => row.Chat)], cancellationToken);
        var serviceNames = await views.ServiceNamesAsync(rows.Select(row => row.LastMessage), cancellationToken);

        return [.. rows.Select(row => new ChatSummaryResponse(
            row.Chat.Id,
            counterparts[row.Chat.Id],
            row.LastMessage is null ? null : ChatViews.ToResponse(row.LastMessage),
            ChatViews.Preview(row.LastMessage, serviceNames),
            row.LastMessage?.SentAt ?? row.Chat.CreatedAt,
            unread.GetValueOrDefault(row.Chat.Id),
            row.Chat.BlockedBy))];
    }

    public async Task<UnreadResponse> UnreadAsync(ChatRole role, CancellationToken cancellationToken)
    {
        var sideId = await access.SideIdAsync(role, cancellationToken);
        return new UnreadResponse((await chats.UnreadAsync(role, sideId, cancellationToken)).Values.Sum());
    }

    public async Task<ChatThreadResponse> ThreadAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken)
    {
        var chat = await access.ChatAsync(chatId, role, cancellationToken);
        var clearedAt = ChatSides.ClearedAt(chat, role);
        var pageSize = options.Value.PageSize;
        var newest = await messages.NewestAsync(chat.Id, clearedAt, null, pageSize + 1, cancellationToken);
        var bookingIds = await messages.BookingIdsAsync(chat.Id, clearedAt, cancellationToken);
        var counterparts = await views.CounterpartsAsync(role, [chat], cancellationToken);

        return new ChatThreadResponse(
            ToResponse(chat, role),
            counterparts[chat.Id],
            [.. newest.Take(pageSize).Reverse().Select(ChatViews.ToResponse)],
            await masters.BookingCardsAsync(bookingIds, cancellationToken),
            newest.Count > pageSize);
    }

    public async Task<ReadResponse> ReadAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken)
    {
        var chat = await access.ChatAsync(chatId, role, cancellationToken);
        var now = clock.GetUtcNow();

        await chats.MarkReadAsync(chat.Id, role, now, cancellationToken);
        await events.ChatReadAsync(chat, role, now, cancellationToken);

        return new ReadResponse(now);
    }

    public async Task<ChatResponse> BlockAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken)
    {
        while (true)
        {
            var chat = await access.ChatAsync(chatId, role, cancellationToken);

            if (chat.BlockedBy is not null)
            {
                throw ChatsErrors.AlreadyBlocked();
            }

            chat.BlockedBy = role;

            if (await chats.SaveAsync(cancellationToken))
            {
                await events.ChatChangedAsync(chat, cancellationToken);
                return ToResponse(chat, role);
            }
        }
    }

    public async Task<ChatResponse> UnblockAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken)
    {
        while (true)
        {
            var chat = await access.ChatAsync(chatId, role, cancellationToken);

            if (chat.BlockedBy is null)
            {
                return ToResponse(chat, role);
            }

            if (chat.BlockedBy != role)
            {
                throw ChatsErrors.NotBlocker();
            }

            chat.BlockedBy = null;

            if (await chats.SaveAsync(cancellationToken))
            {
                await events.ChatChangedAsync(chat, cancellationToken);
                return ToResponse(chat, role);
            }
        }
    }

    public async Task ClearAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken)
    {
        var chat = await access.ChatAsync(chatId, role, cancellationToken);

        await chats.ClearAsync(chat.Id, role, clock.GetUtcNow(), cancellationToken);
        await events.UnreadChangedAsync(chat, role, cancellationToken);
    }

    private static ChatResponse ToResponse(Chat chat, ChatRole role) =>
        new(chat.Id, chat.BlockedBy, ChatSides.ReadAt(chat, ChatSides.Other(role)));
}
