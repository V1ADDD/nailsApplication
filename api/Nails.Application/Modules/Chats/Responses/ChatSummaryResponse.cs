using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Responses;

public sealed record ChatSummaryResponse(
    Guid ChatId,
    CounterpartResponse Counterpart,
    MessageResponse? LastMessage,
    string LastMessagePreview,
    DateTimeOffset LastActivityAt,
    int Unread,
    ChatRole? BlockedBy);
