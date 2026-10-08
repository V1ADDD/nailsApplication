using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IFavoriteRepository
{
    Task<bool> MasterExistsAsync(Guid masterId, CancellationToken cancellationToken);

    Task<bool> ExistsAsync(Guid userId, Guid masterId, CancellationToken cancellationToken);

    void Add(Favorite favorite);

    Task RemoveAsync(Guid userId, Guid masterId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Guid>> MasterIdsAsync(Guid userId, CancellationToken cancellationToken);
}
