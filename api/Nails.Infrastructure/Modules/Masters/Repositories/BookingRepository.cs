using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class BookingRepository(AppDbContext dbContext) : IBookingRepository
{
    public Task<Master?> FindMasterAsync(Guid masterId, CancellationToken cancellationToken) =>
        dbContext.Set<Master>().AsNoTracking().FirstOrDefaultAsync(master => master.Id == masterId, cancellationToken);

    public Task<MasterService?> FindServiceAsync(Guid masterId, string subcategoryId, CancellationToken cancellationToken) =>
        dbContext.Set<MasterService>()
            .AsNoTracking()
            .FirstOrDefaultAsync(service => service.MasterId == masterId && service.SubcategoryId == subcategoryId, cancellationToken);

    public Task<Slot?> FindSlotAsync(Guid slotId, CancellationToken cancellationToken) =>
        dbContext.Set<Slot>().FirstOrDefaultAsync(slot => slot.Id == slotId, cancellationToken);

    public Task<Booking?> FindBookingAsync(Guid bookingId, CancellationToken cancellationToken) =>
        dbContext.Set<Booking>().FirstOrDefaultAsync(booking => booking.Id == bookingId, cancellationToken);

    public async Task<IReadOnlyList<Booking>> ClientActiveBookingsAsync(
        Guid clientUserId,
        DateTimeOffset now,
        CancellationToken cancellationToken) =>
        await dbContext.Set<Booking>()
            .Where(booking => booking.ClientUserId == clientUserId
                && (booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Confirmed)
                && booking.StartAt.AddMinutes(booking.DurationMin) > now)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<BookingSummaryRow>> SummariesAsync(
        IReadOnlyCollection<Guid> bookingIds,
        CancellationToken cancellationToken)
    {
        if (bookingIds.Count == 0)
        {
            return [];
        }

        return await dbContext.Set<Booking>()
            .AsNoTracking()
            .Where(booking => bookingIds.Contains(booking.Id))
            .Join(
                dbContext.Set<Master>(),
                booking => booking.MasterId,
                master => master.Id,
                (booking, master) => new BookingSummaryRow
                {
                    Id = booking.Id,
                    MasterName = master.Name,
                    SubcategoryId = booking.SubcategoryId,
                    StartAt = booking.StartAt,
                    DurationMin = booking.DurationMin,
                    Address = booking.Address
                })
            .OrderBy(row => row.StartAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Booking>> AutoConfirmCandidatesAsync(DateTimeOffset now, CancellationToken cancellationToken) =>
        await dbContext.Set<Booking>()
            .Where(booking => booking.Status == BookingStatus.Pending
                && booking.CreatedBy == Party.Client
                && dbContext.Set<Schedule>().Any(schedule => schedule.MasterId == booking.MasterId
                    && schedule.AutoConfirmEnabled
                    && booking.CreatedAt.AddMinutes(schedule.AutoConfirmAfterMinutes) <= now))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Booking>> ReleaseCandidatesAsync(DateTimeOffset latestStart, CancellationToken cancellationToken) =>
        await dbContext.Set<Booking>()
            .Where(booking => booking.Status == BookingStatus.Pending && booking.StartAt <= latestStart)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Booking>> CompleteCandidatesAsync(DateTimeOffset now, CancellationToken cancellationToken) =>
        await dbContext.Set<Booking>()
            .Where(booking => booking.Status == BookingStatus.Confirmed && booking.StartAt.AddMinutes(booking.DurationMin) < now)
            .ToListAsync(cancellationToken);

    public void Add(Booking booking) => dbContext.Set<Booking>().Add(booking);

    public async Task<bool> SaveAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            foreach (var entry in dbContext.ChangeTracker.Entries().Where(entry => entry.State != EntityState.Unchanged).ToList())
            {
                entry.State = EntityState.Detached;
            }

            return false;
        }
    }
}
