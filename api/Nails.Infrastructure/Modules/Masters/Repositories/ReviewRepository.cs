using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class ReviewRepository(AppDbContext dbContext) : IReviewRepository
{
    public Task<bool> ExistsAsync(Guid bookingId, Party author, CancellationToken cancellationToken) =>
        dbContext.Set<Review>().AnyAsync(review => review.BookingId == bookingId && review.AuthorRole == author, cancellationToken);

    public void Add(Review review) => dbContext.Set<Review>().Add(review);

    public async Task<bool> SaveAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException exception) when (DatabaseErrors.IsUniqueViolation(exception))
        {
            foreach (var entry in dbContext.ChangeTracker.Entries<Review>().Where(entry => entry.State == EntityState.Added).ToList())
            {
                entry.State = EntityState.Detached;
            }

            return false;
        }
    }

    public async Task<(int Written, int About)> CountsAsync(Guid clientUserId, CancellationToken cancellationToken)
    {
        var counts = await dbContext.Set<Review>()
            .AsNoTracking()
            .Where(review => review.ClientUserId == clientUserId)
            .GroupBy(review => review.AuthorRole)
            .Select(group => new { Author = group.Key, Count = group.Count() })
            .ToListAsync(cancellationToken);

        return (
            counts.FirstOrDefault(item => item.Author == Party.Client)?.Count ?? 0,
            counts.FirstOrDefault(item => item.Author == Party.Master)?.Count ?? 0);
    }

    public async Task<Page<MyReviewRow>> PageAsync(
        Guid clientUserId,
        Party author,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Set<Review>()
            .AsNoTracking()
            .Where(review => review.ClientUserId == clientUserId && review.AuthorRole == author);
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(review => review.CreatedAt)
            .ThenByDescending(review => review.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Join(
                dbContext.Set<Master>(),
                review => review.MasterId,
                master => master.Id,
                (review, master) => new MyReviewRow
                {
                    Id = review.Id,
                    MasterId = master.Id,
                    MasterName = master.Name,
                    MasterPhotoUrl = master.PhotoUrl,
                    SubcategoryId = review.SubcategoryId,
                    Rating = review.Rating,
                    Text = review.Text,
                    CreatedAt = review.CreatedAt
                })
            .ToListAsync(cancellationToken);

        return new Page<MyReviewRow>(items, total);
    }
}
