namespace Nails.Application.Modules.Chats.Responses;

public sealed record MessageUpdatedEvent(Guid ChatId, MessageResponse Message, string Preview);
