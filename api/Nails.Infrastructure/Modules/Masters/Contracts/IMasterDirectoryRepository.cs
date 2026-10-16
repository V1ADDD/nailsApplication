using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IMasterDirectoryRepository
{
    Task<Guid?> MasterOfUserAsync(Guid userId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Master>> MastersAsync(IReadOnlyCollection<Guid> masterIds, CancellationToken cancellationToken);

    Task<IReadOnlyList<Guid>> ClientsWithBookingsAsync(Guid masterId, IReadOnlyCollection<Guid> clientUserIds, CancellationToken cancellationToken);

    Task<IReadOnlyList<Booking>> BookingsAsync(IReadOnlyCollection<Guid> bookingIds, CancellationToken cancellationToken);

    Task<IReadOnlyList<Booking>> BookingsOfPairAsync(Guid masterId, Guid clientUserId, CancellationToken cancellationToken);
}
