using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class BookingMoveRepository(AppDbContext dbContext) : IBookingMoveRepository
{
    public Task<BookingMove?> FindOpenAsync(Guid bookingId, CancellationToken cancellationToken) =>
        dbContext.Set<BookingMove>()
            .FirstOrDefaultAsync(move => move.BookingId == bookingId && move.Status == BookingMoveStatus.Open, cancellationToken);

    public async Task<IReadOnlyList<BookingMove>> LapseCandidatesAsync(DateTimeOffset now, CancellationToken cancellationToken) =>
        await dbContext.Set<BookingMove>()
            .Where(move => move.Status == BookingMoveStatus.Open && move.LapsesAt <= now)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<BookingMove>> OpenMovesOfClientAsync(
        Guid clientUserId,
        DateTimeOffset now,
        CancellationToken cancellationToken) =>
        await dbContext.Set<BookingMove>()
            .Where(move => move.Status == BookingMoveStatus.Open
                && move.StartAt.AddMinutes(move.DurationMin) > now
                && dbContext.Set<Booking>().Any(booking => booking.Id == move.BookingId && booking.ClientUserId == clientUserId))
            .ToListAsync(cancellationToken);

    public void Add(BookingMove move) => dbContext.Set<BookingMove>().Add(move);
}
