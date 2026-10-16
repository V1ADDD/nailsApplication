using Nails.Infrastructure.Modules.Chats.Entities;
using Nails.Infrastructure.Modules.Chats.Models;

namespace Nails.Infrastructure.Modules.Chats.Contracts;

public interface IChatRepository
{
    Task<Chat?> FindAsync(Guid chatId, CancellationToken cancellationToken);

    Task<Chat?> FindPairAsync(Guid masterId, Guid clientUserId, CancellationToken cancellationToken);

    Task<Chat> EnsurePairAsync(Guid masterId, Guid clientUserId, DateTimeOffset now, CancellationToken cancellationToken);

    Task<IReadOnlyList<ChatListRow>> ListAsync(ChatRole role, Guid sideId, CancellationToken cancellationToken);

    Task<IReadOnlyDictionary<Guid, int>> UnreadAsync(ChatRole role, Guid sideId, CancellationToken cancellationToken);

    Task MarkReadAsync(Guid chatId, ChatRole role, DateTimeOffset at, CancellationToken cancellationToken);

    Task ClearAsync(Guid chatId, ChatRole role, DateTimeOffset at, CancellationToken cancellationToken);

    Task ShowAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken);

    Task TouchAsync(Guid chatId, DateTimeOffset at, CancellationToken cancellationToken);

    Task<bool> SaveAsync(CancellationToken cancellationToken);
}
