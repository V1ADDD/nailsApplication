using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IFavoriteRepository
{
    Task<bool> MasterExistsAsync(Guid masterId, CancellationToken cancellationToken);

    Task<bool> ExistsAsync(Guid userId, Guid masterId, CancellationToken cancellationToken);

    void Add(Favorite favorite);

    Task RemoveAsync(Guid userId, Guid masterId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Guid>> MasterIdsAsync(Guid userId, CancellationToken cancellationToken);

    Task<Page<FavoriteMasterRow>> PageAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken);
}
