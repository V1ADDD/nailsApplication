using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IOfferRepository
{
    Task<IReadOnlyList<Offer>> ListAsync(IReadOnlyCollection<Guid> masterIds, CancellationToken cancellationToken);

    Task<Offer?> FindAsync(Guid masterId, Guid id, CancellationToken cancellationToken);

    Task<bool> ExistsAsync(Guid masterId, string serviceId, Guid exceptId, CancellationToken cancellationToken);

    Task<int> CountAsync(Guid masterId, CancellationToken cancellationToken);

    void Add(Offer offer);

    Task<int> DeleteAsync(Guid masterId, Guid id, CancellationToken cancellationToken);
}
