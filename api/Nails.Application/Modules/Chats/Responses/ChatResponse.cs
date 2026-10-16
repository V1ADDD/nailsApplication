using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Responses;

public sealed record ChatResponse(Guid Id, ChatRole? BlockedBy, DateTimeOffset OtherReadAt);
