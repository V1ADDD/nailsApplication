using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class MasterRepository(AppDbContext dbContext) : IMasterRepository
{
    public Task<MasterProfile?> FindByUserAsync(Guid userId, CancellationToken cancellationToken) =>
        dbContext.Set<MasterProfile>().SingleOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

    public Task<Guid?> FindIdByUserAsync(Guid userId, CancellationToken cancellationToken) =>
        dbContext.Set<MasterProfile>()
            .Where(profile => profile.UserId == userId)
            .Select(profile => (Guid?)profile.Id)
            .SingleOrDefaultAsync(cancellationToken);

    public Task<MasterProfile?> FindPublicAsync(Guid id, CancellationToken cancellationToken)
    {
        var offers = dbContext.Set<Offer>();

        return dbContext.Set<MasterProfile>()
            .AsNoTracking()
            .Where(profile => profile.Id == id && offers.Any(offer => offer.MasterId == profile.Id))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<Page<MasterProfile>> SearchAsync(MasterSearch search, CancellationToken cancellationToken)
    {
        var categoryId = search.CategoryId;
        var serviceId = search.ServiceId;
        var cityId = search.CityId;
        var offers = dbContext.Set<Offer>();
        var masters = dbContext.Set<MasterProfile>().AsNoTracking();

        if (cityId is not null)
        {
            masters = masters.Where(profile => profile.CityId == cityId);
        }

        masters = masters.Where(profile => offers.Any(offer => offer.MasterId == profile.Id
            && (categoryId == null || offer.CategoryId == categoryId)
            && (serviceId == null || offer.ServiceId == serviceId)));

        var total = await masters.CountAsync(cancellationToken);
        var ordered = serviceId is null
            ? masters.OrderByDescending(profile => profile.CreatedAt)
            : masters
                .OrderBy(profile => offers
                    .Where(offer => offer.MasterId == profile.Id && offer.ServiceId == serviceId)
                    .Min(offer => (decimal?)offer.Price))
                .ThenByDescending(profile => profile.CreatedAt);

        var items = await ordered
            .ThenBy(profile => profile.Id)
            .Skip((search.Page - 1) * search.PageSize)
            .Take(search.PageSize)
            .ToListAsync(cancellationToken);

        return new Page<MasterProfile>(items, total);
    }

    public void Add(MasterProfile profile) => dbContext.Set<MasterProfile>().Add(profile);
}
