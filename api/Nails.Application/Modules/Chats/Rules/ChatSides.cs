using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Rules;

public static class ChatSides
{
    public static ChatRole Other(ChatRole role) => role == ChatRole.Client ? ChatRole.Master : ChatRole.Client;

    public static Guid SideId(Chat chat, ChatRole role) => role == ChatRole.Client ? chat.ClientUserId : chat.MasterId;

    public static DateTimeOffset ReadAt(Chat chat, ChatRole role) => role == ChatRole.Client ? chat.ClientReadAt : chat.MasterReadAt;

    public static DateTimeOffset? ClearedAt(Chat chat, ChatRole role) => role == ChatRole.Client ? chat.ClientClearedAt : chat.MasterClearedAt;
}
