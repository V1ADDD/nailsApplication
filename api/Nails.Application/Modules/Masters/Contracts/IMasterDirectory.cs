namespace Nails.Application.Modules.Masters.Contracts;

public interface IMasterDirectory
{
    Task<Guid?> MasterOfUserAsync(Guid userId, CancellationToken cancellationToken);

    Task<IReadOnlyDictionary<Guid, MasterSummary>> MastersAsync(IReadOnlyCollection<Guid> masterIds, CancellationToken cancellationToken);

    Task<IReadOnlySet<Guid>> ClientsWithBookingsAsync(Guid masterId, IReadOnlyCollection<Guid> clientUserIds, CancellationToken cancellationToken);

    Task<IReadOnlyList<BookingCard>> BookingCardsAsync(IReadOnlyCollection<Guid> bookingIds, CancellationToken cancellationToken);

    Task<IReadOnlyList<PairBooking>> BookingsOfPairAsync(Guid masterId, Guid clientUserId, CancellationToken cancellationToken);
}
