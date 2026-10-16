using Nails.Application.Common.Exceptions;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Rules;

public static class MessageRules
{
    public static string? Send(ChatRole? blockedBy, string? text, string? mediaUrl) =>
        blockedBy is not null ? ErrorCodes.ChatBlocked
        : string.IsNullOrEmpty(text) && string.IsNullOrEmpty(mediaUrl) ? ErrorCodes.EmptyMessage
        : null;

    public static string? Change(Message message, bool isAuthor) =>
        message.Kind != MessageKind.Text || !isAuthor ? ErrorCodes.NotAuthor
        : message.DeletedAt is not null ? ErrorCodes.MessageDeleted
        : null;

    public static string? Edit(Message message, string text, bool isAuthor) =>
        Change(message, isAuthor) ?? (text.Length == 0 && message.MediaUrl is null ? ErrorCodes.EmptyMessage : null);
}
