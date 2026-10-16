namespace Nails.Infrastructure.Modules.Chats.Entities;

public sealed class Message
{
    public const int TextMaxLength = 2000;
    public const int MediaUrlMaxLength = 200;

    public Guid Id { get; set; }

    public Guid ChatId { get; set; }

    public MessageKind Kind { get; set; }

    public ChatRole? AuthorRole { get; set; }

    public string? Text { get; set; }

    public string? MediaUrl { get; set; }

    public Guid? BookingId { get; set; }

    public DateTimeOffset SentAt { get; set; }

    public DateTimeOffset? EditedAt { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }
}
