using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IBookingMoveRepository
{
    Task<BookingMove?> FindOpenAsync(Guid bookingId, CancellationToken cancellationToken);

    Task<IReadOnlyList<BookingMove>> LapseCandidatesAsync(DateTimeOffset now, CancellationToken cancellationToken);

    Task<IReadOnlyList<BookingMove>> OpenMovesOfClientAsync(Guid clientUserId, DateTimeOffset now, CancellationToken cancellationToken);

    void Add(BookingMove move);
}
