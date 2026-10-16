using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Responses;

public sealed record MessageResponse(
    Guid Id,
    MessageKind Kind,
    ChatRole? AuthorRole,
    string? Text,
    string? MediaUrl,
    Guid? BookingId,
    DateTimeOffset SentAt,
    DateTimeOffset? EditedAt,
    bool Deleted);
