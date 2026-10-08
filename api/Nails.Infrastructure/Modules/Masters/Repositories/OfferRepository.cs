using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class OfferRepository(AppDbContext dbContext) : IOfferRepository
{
    public async Task<IReadOnlyList<Offer>> ListAsync(IReadOnlyCollection<Guid> masterIds, CancellationToken cancellationToken) =>
        await dbContext.Set<Offer>()
            .AsNoTracking()
            .Where(offer => masterIds.Contains(offer.MasterId))
            .ToListAsync(cancellationToken);

    public Task<Offer?> FindAsync(Guid masterId, Guid id, CancellationToken cancellationToken) =>
        dbContext.Set<Offer>().SingleOrDefaultAsync(offer => offer.MasterId == masterId && offer.Id == id, cancellationToken);

    public Task<bool> ExistsAsync(Guid masterId, string serviceId, Guid exceptId, CancellationToken cancellationToken) =>
        dbContext.Set<Offer>().AnyAsync(
            offer => offer.MasterId == masterId && offer.ServiceId == serviceId && offer.Id != exceptId,
            cancellationToken);

    public Task<int> CountAsync(Guid masterId, CancellationToken cancellationToken) =>
        dbContext.Set<Offer>().CountAsync(offer => offer.MasterId == masterId, cancellationToken);

    public void Add(Offer offer) => dbContext.Set<Offer>().Add(offer);

    public Task<int> DeleteAsync(Guid masterId, Guid id, CancellationToken cancellationToken) =>
        dbContext.Set<Offer>().Where(offer => offer.MasterId == masterId && offer.Id == id).ExecuteDeleteAsync(cancellationToken);
}
