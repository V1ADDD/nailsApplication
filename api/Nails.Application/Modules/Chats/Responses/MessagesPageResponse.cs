namespace Nails.Application.Modules.Chats.Responses;

public sealed record MessagesPageResponse(IReadOnlyList<MessageResponse> Items, bool HasOlder);
