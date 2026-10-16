using Nails.Application.Common.Realtime;
using Nails.Application.Modules.Chats.Responses;
using Nails.Application.Modules.Chats.Rules;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Chats.Contracts;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Services;

public sealed class ChatEvents(IRealtimePublisher realtime, IMasterDirectory masters, IChatRepository chats, ChatViews views)
{
    private readonly Dictionary<Guid, Guid> _masterUsers = [];

    public async Task MessageCreatedAsync(Chat chat, Message message, CancellationToken cancellationToken)
    {
        var masterUserId = await MasterUserIdAsync(chat.MasterId, cancellationToken);
        var payload = new MessageCreatedEvent(
            chat.Id,
            ChatViews.ToResponse(message),
            await views.PreviewAsync(message, cancellationToken),
            masterUserId,
            chat.ClientUserId);

        await realtime.ToUsersAsync([masterUserId, chat.ClientUserId], RealtimeEvents.MessageCreated, payload, cancellationToken);

        if (message.AuthorRole is { } author)
        {
            await UnreadChangedAsync(chat, ChatSides.Other(author), cancellationToken);
        }
    }

    public async Task MessageUpdatedAsync(Chat chat, Message message, CancellationToken cancellationToken)
    {
        var masterUserId = await MasterUserIdAsync(chat.MasterId, cancellationToken);
        var payload = new MessageUpdatedEvent(chat.Id, ChatViews.ToResponse(message), await views.PreviewAsync(message, cancellationToken));

        await realtime.ToUsersAsync([masterUserId, chat.ClientUserId], RealtimeEvents.MessageUpdated, payload, cancellationToken);

        if (message.AuthorRole is { } author)
        {
            await UnreadChangedAsync(chat, ChatSides.Other(author), cancellationToken);
        }
    }

    public async Task ChatReadAsync(Chat chat, ChatRole role, DateTimeOffset readAt, CancellationToken cancellationToken)
    {
        var masterUserId = await MasterUserIdAsync(chat.MasterId, cancellationToken);

        await realtime.ToUsersAsync(
            [masterUserId, chat.ClientUserId],
            RealtimeEvents.ChatRead,
            new ChatReadEvent(chat.Id, role, readAt),
            cancellationToken);
        await UnreadChangedAsync(chat, role, cancellationToken);
    }

    public async Task ChatChangedAsync(Chat chat, CancellationToken cancellationToken)
    {
        var masterUserId = await MasterUserIdAsync(chat.MasterId, cancellationToken);

        await realtime.ToUsersAsync(
            [masterUserId, chat.ClientUserId],
            RealtimeEvents.ChatChanged,
            new ChatChangedEvent(chat.Id, chat.BlockedBy),
            cancellationToken);
    }

    public async Task UnreadChangedAsync(Chat chat, ChatRole role, CancellationToken cancellationToken)
    {
        var userId = role == ChatRole.Client ? chat.ClientUserId : await MasterUserIdAsync(chat.MasterId, cancellationToken);
        var count = (await chats.UnreadAsync(role, ChatSides.SideId(chat, role), cancellationToken)).Values.Sum();

        await realtime.ToUsersAsync([userId], RealtimeEvents.UnreadChanged, new UnreadChangedEvent(role, count), cancellationToken);
    }

    private async Task<Guid> MasterUserIdAsync(Guid masterId, CancellationToken cancellationToken)
    {
        if (!_masterUsers.TryGetValue(masterId, out var userId))
        {
            var summaries = await masters.MastersAsync([masterId], cancellationToken);
            userId = summaries.GetValueOrDefault(masterId)?.UserId ?? Guid.Empty;
            _masterUsers[masterId] = userId;
        }

        return userId;
    }
}
