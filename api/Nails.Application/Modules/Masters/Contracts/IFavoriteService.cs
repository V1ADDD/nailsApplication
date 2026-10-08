namespace Nails.Application.Modules.Masters.Contracts;

public interface IFavoriteService
{
    Task AddAsync(Guid masterId, CancellationToken cancellationToken);

    Task RemoveAsync(Guid masterId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Guid>> MasterIdsAsync(CancellationToken cancellationToken);
}
