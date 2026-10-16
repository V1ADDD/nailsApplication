using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Responses;

public sealed record ChatReadEvent(Guid ChatId, ChatRole Role, DateTimeOffset ReadAt);
