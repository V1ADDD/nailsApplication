using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Responses;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Services;

public sealed class MasterDirectory(IMasterDirectoryRepository directory, IPresence presence, ICatalog catalog) : IMasterDirectory
{
    public Task<Guid?> MasterOfUserAsync(Guid userId, CancellationToken cancellationToken) =>
        directory.MasterOfUserAsync(userId, cancellationToken);

    public async Task<IReadOnlyDictionary<Guid, MasterSummary>> MastersAsync(
        IReadOnlyCollection<Guid> masterIds,
        CancellationToken cancellationToken)
    {
        var masters = await directory.MastersAsync([.. masterIds.Distinct()], cancellationToken);
        var online = await presence.OnlineUsersAsync([.. masters.Select(master => master.UserId)], cancellationToken);

        return masters.ToDictionary(
            master => master.Id,
            master => new MasterSummary(
                master.Id,
                master.UserId,
                master.Name,
                master.PhotoUrl,
                master.Specialty,
                master.DeletedAt is null && MasterFacts.IsOnline(master.ShowOnline, master.UserId, online),
                master.DeletedAt is not null));
    }

    public async Task<IReadOnlySet<Guid>> ClientsWithBookingsAsync(
        Guid masterId,
        IReadOnlyCollection<Guid> clientUserIds,
        CancellationToken cancellationToken) =>
        (await directory.ClientsWithBookingsAsync(masterId, [.. clientUserIds.Distinct()], cancellationToken)).ToHashSet();

    public async Task<IReadOnlyList<BookingCard>> BookingCardsAsync(
        IReadOnlyCollection<Guid> bookingIds,
        CancellationToken cancellationToken) =>
        [.. (await directory.BookingsAsync([.. bookingIds.Distinct()], cancellationToken))
            .OrderBy(booking => booking.CreatedAt)
            .Select(ToCard)];

    public async Task<IReadOnlyList<PairBooking>> BookingsOfPairAsync(
        Guid masterId,
        Guid clientUserId,
        CancellationToken cancellationToken) =>
        [.. (await directory.BookingsOfPairAsync(masterId, clientUserId, cancellationToken))
            .Select(booking => new PairBooking(booking.Id, booking.CreatedBy == Party.Master, booking.CreatedAt))];

    private BookingCard ToCard(Booking booking) => new(
        booking.Id,
        booking.MasterId,
        booking.ClientUserId,
        booking.SubcategoryId,
        catalog.SubcategoryName(booking.SubcategoryId),
        new PriceResponse(booking.PriceKind, booking.PriceAmount),
        booking.StartAt,
        booking.DurationMin,
        booking.Status,
        booking.CreatedBy,
        booking.CancelledBy,
        booking.CancelReason,
        booking.CancelMutual,
        booking.CancelExpired,
        booking.Status == BookingStatus.Pending ? Bookings.PendingReleaseAt(booking.StartAt, booking.CreatedAt) : null);
}
