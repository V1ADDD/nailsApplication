using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Infrastructure.Modules.Chats.Models;

public sealed class ChatListRow
{
    public required Chat Chat { get; init; }

    public Message? LastMessage { get; init; }
}
