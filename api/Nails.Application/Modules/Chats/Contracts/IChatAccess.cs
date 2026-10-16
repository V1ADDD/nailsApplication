using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Contracts;

public interface IChatAccess
{
    Guid UserId { get; }

    Task<Guid?> MasterIdAsync(CancellationToken cancellationToken);

    Task<Guid> SideIdAsync(ChatRole role, CancellationToken cancellationToken);

    Task<Chat> ChatAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken);

    Task<bool> IsAuthorAsync(Chat chat, Message message, CancellationToken cancellationToken);
}
