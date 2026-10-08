using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class MasterSearchRepository(AppDbContext dbContext) : IMasterSearchRepository
{
    public async Task<IReadOnlyList<MasterCandidate>> FindCandidatesAsync(CandidateQuery query, CancellationToken cancellationToken)
    {
        var masters = dbContext.Set<Master>().AsNoTracking().Where(master => master.DeletedAt == null);
        var services = dbContext.Set<MasterService>();
        var reviews = dbContext.Set<Review>().Where(review => review.AuthorRole == Party.Client);
        var bookings = dbContext.Set<Booking>().Where(booking => booking.Status == BookingStatus.Completed);
        var freeSlots = dbContext.Set<Slot>().Where(slot => slot.Status == SlotStatus.Free && slot.StartAt > query.Now);

        masters = masters.Where(master => services.Any(service => service.MasterId == master.Id));

        if (query.MasterIds is { } ids)
        {
            masters = masters.Where(master => ids.Contains(master.Id));
        }

        if (query.City is { } city)
        {
            masters = masters.Where(master => master.City == city);
        }

        if (query.Box is { } box)
        {
            masters = masters.Where(master =>
                master.Lat >= box.MinLat && master.Lat <= box.MaxLat && master.Lng >= box.MinLng && master.Lng <= box.MaxLng);
        }

        if (query.VerifiedOnly)
        {
            masters = masters.Where(master => master.VerificationStatus == VerificationStatus.Verified);
        }

        if (query.FreeWindow is { } window)
        {
            freeSlots = freeSlots.Where(slot => slot.StartAt >= window.From && slot.StartAt < window.To);
            masters = masters.Where(master => freeSlots.Any(slot => slot.MasterId == master.Id));
        }

        return await masters
            .Select(master => new MasterCandidate
            {
                Id = master.Id,
                UserId = master.UserId,
                Name = master.Name,
                PhotoUrl = master.PhotoUrl,
                Specialty = master.Specialty,
                City = master.City,
                District = master.District,
                Lat = master.Lat,
                Lng = master.Lng,
                ExperienceYears = master.ExperienceYears,
                Verified = master.VerificationStatus == VerificationStatus.Verified,
                ShowOnline = master.ShowOnline,
                Services = services
                    .Where(service => service.MasterId == master.Id)
                    .OrderBy(service => service.SortOrder)
                    .Select(service => new CandidateService
                    {
                        SubcategoryId = service.SubcategoryId,
                        PriceKind = service.PriceKind,
                        PriceAmount = service.PriceAmount,
                        DurationMin = service.DurationMin
                    })
                    .ToList(),
                RatingAverage = reviews.Where(review => review.MasterId == master.Id).Average(review => (double?)review.Rating),
                ReviewsCount = reviews.Count(review => review.MasterId == master.Id),
                CompletedBookings = bookings.Count(booking => booking.MasterId == master.Id),
                NextFreeSlotAt = query.IncludeNextFreeSlot
                    ? freeSlots.Where(slot => slot.MasterId == master.Id).Min(slot => (DateTimeOffset?)slot.StartAt)
                    : null
            })
            .AsSplitQuery()
            .ToListAsync(cancellationToken);
    }
}
