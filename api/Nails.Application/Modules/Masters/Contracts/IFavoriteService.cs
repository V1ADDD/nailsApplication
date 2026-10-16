using Nails.Application.Common.Paging;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Application.Modules.Masters.Contracts;

public interface IFavoriteService
{
    Task AddAsync(Guid masterId, CancellationToken cancellationToken);

    Task RemoveAsync(Guid masterId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Guid>> MasterIdsAsync(CancellationToken cancellationToken);

    Task<PagedResponse<FavoriteMasterResponse>> ListAsync(FavoritesRequest request, CancellationToken cancellationToken);
}
