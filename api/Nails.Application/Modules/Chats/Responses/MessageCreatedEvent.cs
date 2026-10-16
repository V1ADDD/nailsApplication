namespace Nails.Application.Modules.Chats.Responses;

public sealed record MessageCreatedEvent(Guid ChatId, MessageResponse Message, string Preview, Guid MasterUserId, Guid ClientUserId);
