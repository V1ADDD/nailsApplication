namespace Nails.Application.Modules.Chats.Requests;

public sealed class StartChatRequest
{
    public Guid? MasterId { get; init; }

    public Guid? ClientId { get; init; }
}
