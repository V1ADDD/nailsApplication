using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class MyBookingRepository(AppDbContext dbContext) : IMyBookingRepository
{
    public async Task<Page<MyBookingRow>> PageAsync(
        Guid clientUserId,
        bool upcoming,
        DateTimeOffset now,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var mine = dbContext.Set<Booking>()
            .AsNoTracking()
            .Where(booking => booking.ClientUserId == clientUserId && booking.Source == BookingSource.Site);
        var query = upcoming
            ? mine.Where(booking => (booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Confirmed) && booking.StartAt > now)
            : mine.Where(booking => !((booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Confirmed) && booking.StartAt > now));
        var total = await query.CountAsync(cancellationToken);
        var ordered = upcoming
            ? query.OrderBy(booking => booking.StartAt).ThenBy(booking => booking.Id)
            : query.OrderByDescending(booking => booking.StartAt).ThenByDescending(booking => booking.Id);
        var bookings = await ordered.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new Page<MyBookingRow>(await RowsAsync(bookings, cancellationToken), total);
    }

    public async Task<MyBookingRow?> FindAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var booking = await dbContext.Set<Booking>().AsNoTracking().FirstOrDefaultAsync(item => item.Id == bookingId, cancellationToken);

        return booking is null ? null : (await RowsAsync([booking], cancellationToken)) is [var row] ? row : null;
    }

    private async Task<IReadOnlyList<MyBookingRow>> RowsAsync(List<Booking> bookings, CancellationToken cancellationToken)
    {
        if (bookings.Count == 0)
        {
            return [];
        }

        var bookingIds = bookings.Select(booking => booking.Id).ToList();
        var masterIds = bookings.Select(booking => booking.MasterId).Distinct().ToList();
        var masters = await dbContext.Set<Master>()
            .AsNoTracking()
            .Where(master => masterIds.Contains(master.Id))
            .ToDictionaryAsync(master => master.Id, cancellationToken);
        var reviews = await dbContext.Set<Review>()
            .AsNoTracking()
            .Where(review => review.BookingId != null && bookingIds.Contains(review.BookingId.Value) && review.AuthorRole == Party.Client)
            .ToDictionaryAsync(review => review.BookingId!.Value, cancellationToken);
        var moves = await dbContext.Set<BookingMove>()
            .AsNoTracking()
            .Where(move => bookingIds.Contains(move.BookingId) && move.Status == BookingMoveStatus.Open)
            .ToDictionaryAsync(move => move.BookingId, cancellationToken);

        return [.. bookings
            .Where(booking => masters.ContainsKey(booking.MasterId))
            .Select(booking => new MyBookingRow
            {
                Booking = booking,
                MasterUserId = masters[booking.MasterId].UserId,
                MasterName = masters[booking.MasterId].Name,
                MasterPhotoUrl = masters[booking.MasterId].PhotoUrl,
                ClientReview = reviews.GetValueOrDefault(booking.Id),
                OpenMove = moves.GetValueOrDefault(booking.Id)
            })];
    }
}
