using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Responses;

public sealed record ChatChangedEvent(Guid ChatId, ChatRole? BlockedBy);
