using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class MasterProfileRepository(AppDbContext dbContext) : IMasterProfileRepository
{
    public Task<MasterProfileRow?> FindAsync(Guid masterId, Guid viewerUserId, CancellationToken cancellationToken)
    {
        var reviews = dbContext.Set<Review>().Where(review => review.AuthorRole == Party.Client);
        var completed = dbContext.Set<Booking>().Where(booking => booking.Status == BookingStatus.Completed);

        return dbContext.Set<Master>()
            .AsNoTracking()
            .VisibleTo(dbContext, viewerUserId)
            .Where(master => master.Id == masterId)
            .Select(master => new MasterProfileRow
            {
                Id = master.Id,
                UserId = master.UserId,
                Name = master.Name,
                PhotoUrl = master.PhotoUrl,
                Specialty = master.Specialty,
                CategoryIds = master.CategoryIds,
                City = master.City,
                District = master.District,
                Address = master.Address,
                Lat = master.Lat,
                Lng = master.Lng,
                ExperienceYears = master.ExperienceYears,
                Verified = master.VerificationStatus == VerificationStatus.Verified,
                ShowOnline = master.ShowOnline,
                About = master.About,
                Phone = master.Phone,
                Email = master.Email,
                Telegram = master.Telegram,
                Viber = master.Viber,
                Instagram = master.Instagram,
                Services = dbContext.Set<MasterService>()
                    .Where(service => service.MasterId == master.Id)
                    .OrderBy(service => service.SortOrder)
                    .Select(service => new ProfileServiceRow
                    {
                        Id = service.Id,
                        SubcategoryId = service.SubcategoryId,
                        PriceKind = service.PriceKind,
                        PriceAmount = service.PriceAmount,
                        DurationMin = service.DurationMin
                    })
                    .ToList(),
                Courses = dbContext.Set<Course>()
                    .Where(course => course.MasterId == master.Id)
                    .OrderBy(course => course.SortOrder)
                    .Select(course => new CourseRow { Title = course.Title, School = course.School, Year = course.Year })
                    .ToList(),
                Portfolio = dbContext.Set<PortfolioPhoto>()
                    .Where(photo => photo.MasterId == master.Id)
                    .OrderBy(photo => photo.SortOrder)
                    .Select(photo => new PortfolioRow { Id = photo.Id, Url = photo.Url, Hue = photo.Hue, Caption = photo.Caption })
                    .ToList(),
                RatingAverage = reviews.Where(review => review.MasterId == master.Id).Average(review => (double?)review.Rating),
                ReviewsCount = reviews.Count(review => review.MasterId == master.Id),
                CompletedBookings = completed.Count(booking => booking.MasterId == master.Id)
            })
            .AsSplitQuery()
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<bool> ExistsAsync(Guid masterId, Guid viewerUserId, CancellationToken cancellationToken) =>
        dbContext.Set<Master>().VisibleTo(dbContext, viewerUserId).AnyAsync(master => master.Id == masterId, cancellationToken);

    public async Task<IReadOnlyList<Slot>> SlotsAsync(
        Guid masterId,
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken) =>
        await dbContext.Set<Slot>()
            .AsNoTracking()
            .Where(slot => slot.MasterId == masterId && slot.StartAt > from && slot.StartAt < to)
            .OrderBy(slot => slot.StartAt)
            .ToListAsync(cancellationToken);

    public async Task<Page<ReviewRow>> ReviewsAsync(Guid masterId, int page, int pageSize, CancellationToken cancellationToken)
    {
        var query = dbContext.Set<Review>()
            .AsNoTracking()
            .Where(review => review.MasterId == masterId && review.AuthorRole == Party.Client);
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(review => review.CreatedAt)
            .ThenByDescending(review => review.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(review => new ReviewRow
            {
                Id = review.Id,
                ClientUserId = review.ClientUserId,
                SubcategoryId = review.SubcategoryId,
                Rating = review.Rating,
                Text = review.Text,
                CreatedAt = review.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new Page<ReviewRow>(items, total);
    }
}
