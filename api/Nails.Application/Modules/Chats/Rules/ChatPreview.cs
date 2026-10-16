using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Rules;

public static class ChatPreview
{
    public const string NoMessages = "Нет сообщений";
    public const string Deleted = "Сообщение удалено";
    public const string Photo = "📷 Фото";

    public static string For(Message? message, string? serviceName) => message switch
    {
        null => NoMessages,
        { DeletedAt: not null } => Deleted,
        { Kind: MessageKind.Booking } => $"Запись: {serviceName}",
        { Text: null or "", MediaUrl: not null } => Photo,
        _ => message.Text ?? string.Empty
    };
}
