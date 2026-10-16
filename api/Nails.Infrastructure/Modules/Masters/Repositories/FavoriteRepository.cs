using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class FavoriteRepository(AppDbContext dbContext) : IFavoriteRepository
{
    public Task<bool> MasterExistsAsync(Guid masterId, CancellationToken cancellationToken) =>
        dbContext.Set<Master>().Listed(dbContext).AnyAsync(master => master.Id == masterId, cancellationToken);

    public Task<bool> ExistsAsync(Guid userId, Guid masterId, CancellationToken cancellationToken) =>
        dbContext.Set<Favorite>().AnyAsync(favorite => favorite.UserId == userId && favorite.MasterId == masterId, cancellationToken);

    public void Add(Favorite favorite) => dbContext.Set<Favorite>().Add(favorite);

    public Task RemoveAsync(Guid userId, Guid masterId, CancellationToken cancellationToken) =>
        dbContext.Set<Favorite>()
            .Where(favorite => favorite.UserId == userId && favorite.MasterId == masterId)
            .ExecuteDeleteAsync(cancellationToken);

    public async Task<Page<FavoriteMasterRow>> PageAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
    {
        var reviews = dbContext.Set<Review>().Where(review => review.AuthorRole == Party.Client);
        var listed = dbContext.Set<Master>().Listed(dbContext);
        var query = dbContext.Set<Favorite>()
            .AsNoTracking()
            .Where(favorite => favorite.UserId == userId)
            .Join(listed, favorite => favorite.MasterId, master => master.Id, (favorite, master) => new { favorite.CreatedAt, Master = master });
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(item => item.CreatedAt)
            .ThenBy(item => item.Master.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(item => new FavoriteMasterRow
            {
                Id = item.Master.Id,
                Name = item.Master.Name,
                PhotoUrl = item.Master.PhotoUrl,
                Specialty = item.Master.Specialty,
                Verified = item.Master.VerificationStatus == VerificationStatus.Verified,
                RatingAverage = reviews.Where(review => review.MasterId == item.Master.Id).Average(review => (double?)review.Rating),
                ReviewsCount = reviews.Count(review => review.MasterId == item.Master.Id)
            })
            .ToListAsync(cancellationToken);

        return new Page<FavoriteMasterRow>(items, total);
    }

    public async Task<IReadOnlyList<Guid>> MasterIdsAsync(Guid userId, CancellationToken cancellationToken) =>
        await dbContext.Set<Favorite>()
            .AsNoTracking()
            .Where(favorite => favorite.UserId == userId)
            .OrderByDescending(favorite => favorite.CreatedAt)
            .Select(favorite => favorite.MasterId)
            .ToListAsync(cancellationToken);
}
