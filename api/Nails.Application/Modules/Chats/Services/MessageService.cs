using Microsoft.Extensions.Options;
using Nails.Application.Common.Media;
using Nails.Application.Modules.Chats.Contracts;
using Nails.Application.Modules.Chats.Options;
using Nails.Application.Modules.Chats.Requests;
using Nails.Application.Modules.Chats.Responses;
using Nails.Application.Modules.Chats.Rules;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Chats.Contracts;
using Nails.Infrastructure.Modules.Chats.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Chats.Services;

public sealed class MessageService(
    IChatAccess access,
    IChatRepository chats,
    IMessageRepository messages,
    IMasterDirectory masters,
    IMediaOwnership media,
    IUnitOfWork unitOfWork,
    ChatEvents events,
    TimeProvider clock,
    IOptions<ChatMessagesOptions> options) : IMessageService
{
    public async Task<MessagesPageResponse> PageAsync(
        Guid chatId,
        ChatRole role,
        MessagesPageRequest request,
        CancellationToken cancellationToken)
    {
        var chat = await access.ChatAsync(chatId, role, cancellationToken);
        var limit = Math.Min(request.Limit ?? options.Value.PageSize, options.Value.MaxPageSize);
        var newest = await messages.NewestAsync(chat.Id, ChatSides.ClearedAt(chat, role), request.Before, limit + 1, cancellationToken);

        return new MessagesPageResponse([.. newest.Take(limit).Reverse().Select(ChatViews.ToResponse)], newest.Count > limit);
    }

    public async Task<MessageResponse> SendAsync(
        Guid chatId,
        ChatRole role,
        SendMessageRequest request,
        CancellationToken cancellationToken)
    {
        var chat = await access.ChatAsync(chatId, role, cancellationToken);
        var text = request.Text?.Trim();
        var mediaUrl = string.IsNullOrWhiteSpace(request.MediaUrl) ? null : request.MediaUrl.Trim();

        if (MessageRules.Send(chat.BlockedBy, text, mediaUrl) is { } error)
        {
            throw ChatsErrors.For(error);
        }

        if (mediaUrl is not null && !await media.IsOwnedByAsync(mediaUrl, access.UserId, cancellationToken))
        {
            throw MediaErrors.NotOwned();
        }

        if (role == ChatRole.Client
            && (await masters.MastersAsync([chat.MasterId], cancellationToken)).GetValueOrDefault(chat.MasterId) is not { Deleted: false })
        {
            throw ChatsErrors.MasterNotFound();
        }

        var message = new Message
        {
            Id = Guid.CreateVersion7(),
            ChatId = chat.Id,
            Kind = MessageKind.Text,
            AuthorRole = role,
            Text = string.IsNullOrEmpty(text) ? null : text,
            MediaUrl = mediaUrl,
            SentAt = clock.GetUtcNow()
        };
        messages.Add(message);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await chats.TouchAsync(chat.Id, message.SentAt, cancellationToken);
        await chats.MarkReadAsync(chat.Id, role, message.SentAt, cancellationToken);

        await events.MessageCreatedAsync(chat, message, cancellationToken);

        return ChatViews.ToResponse(message);
    }

    public async Task<MessageResponse> EditAsync(Guid messageId, EditMessageRequest request, CancellationToken cancellationToken)
    {
        var (chat, message) = await LoadAsync(messageId, cancellationToken);
        var text = request.Text.Trim();

        if (MessageRules.Edit(message, text, await access.IsAuthorAsync(chat, message, cancellationToken)) is { } error)
        {
            throw ChatsErrors.For(error);
        }

        message.Text = text.Length == 0 ? null : text;
        message.EditedAt = clock.GetUtcNow();
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await events.MessageUpdatedAsync(chat, message, cancellationToken);

        return ChatViews.ToResponse(message);
    }

    public async Task<MessageResponse> DeleteAsync(Guid messageId, CancellationToken cancellationToken)
    {
        var (chat, message) = await LoadAsync(messageId, cancellationToken);

        if (MessageRules.Change(message, await access.IsAuthorAsync(chat, message, cancellationToken)) is { } error)
        {
            throw ChatsErrors.For(error);
        }

        message.Text = null;
        message.MediaUrl = null;
        message.DeletedAt = clock.GetUtcNow();
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await events.MessageUpdatedAsync(chat, message, cancellationToken);

        return ChatViews.ToResponse(message);
    }

    private async Task<(Chat Chat, Message Message)> LoadAsync(Guid messageId, CancellationToken cancellationToken)
    {
        var message = await messages.FindAsync(messageId, cancellationToken) ?? throw ChatsErrors.MessageNotFound();
        var chat = await chats.FindAsync(message.ChatId, cancellationToken);
        var isParty = chat is not null
            && (chat.ClientUserId == access.UserId || await access.MasterIdAsync(cancellationToken) == chat.MasterId);

        return isParty ? (chat!, message) : throw ChatsErrors.MessageNotFound();
    }
}
