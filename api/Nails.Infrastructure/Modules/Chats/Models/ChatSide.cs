namespace Nails.Infrastructure.Modules.Chats.Models;

public sealed class ChatSide
{
    public Guid ChatId { get; init; }

    public DateTimeOffset ReadAt { get; init; }

    public DateTimeOffset? ClearedAt { get; init; }
}
