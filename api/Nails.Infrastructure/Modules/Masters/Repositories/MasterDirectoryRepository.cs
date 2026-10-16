using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class MasterDirectoryRepository(AppDbContext dbContext) : IMasterDirectoryRepository
{
    public async Task<Guid?> MasterOfUserAsync(Guid userId, CancellationToken cancellationToken) =>
        await dbContext.Set<Master>()
            .AsNoTracking()
            .Where(master => master.UserId == userId && master.DeletedAt == null)
            .Select(master => (Guid?)master.Id)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<Master>> MastersAsync(IReadOnlyCollection<Guid> masterIds, CancellationToken cancellationToken) =>
        masterIds.Count == 0
            ? []
            : await dbContext.Set<Master>().AsNoTracking().Where(master => masterIds.Contains(master.Id)).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Guid>> ClientsWithBookingsAsync(
        Guid masterId,
        IReadOnlyCollection<Guid> clientUserIds,
        CancellationToken cancellationToken) =>
        clientUserIds.Count == 0
            ? []
            : await dbContext.Set<Booking>()
                .AsNoTracking()
                .Where(booking => booking.MasterId == masterId
                    && booking.Source == BookingSource.Site
                    && booking.ClientUserId != null
                    && clientUserIds.Contains(booking.ClientUserId.Value))
                .Select(booking => booking.ClientUserId!.Value)
                .Distinct()
                .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Booking>> BookingsAsync(IReadOnlyCollection<Guid> bookingIds, CancellationToken cancellationToken) =>
        bookingIds.Count == 0
            ? []
            : await dbContext.Set<Booking>().AsNoTracking().Where(booking => bookingIds.Contains(booking.Id)).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<BookingMove>> OpenMovesAsync(IReadOnlyCollection<Guid> bookingIds, CancellationToken cancellationToken) =>
        bookingIds.Count == 0
            ? []
            : await dbContext.Set<BookingMove>()
                .AsNoTracking()
                .Where(move => bookingIds.Contains(move.BookingId) && move.Status == BookingMoveStatus.Open)
                .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Booking>> BookingsOfPairAsync(Guid masterId, Guid clientUserId, CancellationToken cancellationToken) =>
        await dbContext.Set<Booking>()
            .AsNoTracking()
            .Where(booking => booking.MasterId == masterId
                && booking.ClientUserId == clientUserId
                && booking.Source == BookingSource.Site)
            .OrderBy(booking => booking.CreatedAt)
            .ToListAsync(cancellationToken);
}
