using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class FavoriteRepository(AppDbContext dbContext) : IFavoriteRepository
{
    public Task<bool> MasterExistsAsync(Guid masterId, CancellationToken cancellationToken) =>
        dbContext.Set<Master>().AnyAsync(master => master.Id == masterId && master.DeletedAt == null, cancellationToken);

    public Task<bool> ExistsAsync(Guid userId, Guid masterId, CancellationToken cancellationToken) =>
        dbContext.Set<Favorite>().AnyAsync(favorite => favorite.UserId == userId && favorite.MasterId == masterId, cancellationToken);

    public void Add(Favorite favorite) => dbContext.Set<Favorite>().Add(favorite);

    public Task RemoveAsync(Guid userId, Guid masterId, CancellationToken cancellationToken) =>
        dbContext.Set<Favorite>()
            .Where(favorite => favorite.UserId == userId && favorite.MasterId == masterId)
            .ExecuteDeleteAsync(cancellationToken);

    public async Task<IReadOnlyList<Guid>> MasterIdsAsync(Guid userId, CancellationToken cancellationToken) =>
        await dbContext.Set<Favorite>()
            .AsNoTracking()
            .Where(favorite => favorite.UserId == userId)
            .OrderByDescending(favorite => favorite.CreatedAt)
            .Select(favorite => favorite.MasterId)
            .ToListAsync(cancellationToken);
}
