using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IBookingRepository
{
    Task<Master?> FindMasterAsync(Guid masterId, CancellationToken cancellationToken);

    Task<MasterService?> FindServiceAsync(Guid masterId, string subcategoryId, CancellationToken cancellationToken);

    Task<Slot?> FindSlotAsync(Guid slotId, CancellationToken cancellationToken);

    Task<Booking?> FindBookingAsync(Guid bookingId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Booking>> ClientActiveBookingsAsync(Guid clientUserId, DateTimeOffset now, CancellationToken cancellationToken);

    Task<IReadOnlyList<BookingSummaryRow>> SummariesAsync(IReadOnlyCollection<Guid> bookingIds, CancellationToken cancellationToken);

    Task<IReadOnlyList<Booking>> AutoConfirmCandidatesAsync(DateTimeOffset now, CancellationToken cancellationToken);

    Task<IReadOnlyList<Booking>> ReleaseCandidatesAsync(DateTimeOffset latestStart, CancellationToken cancellationToken);

    Task<IReadOnlyList<Booking>> CompleteCandidatesAsync(DateTimeOffset now, CancellationToken cancellationToken);

    void Add(Booking booking);

    Task<bool> SaveAsync(CancellationToken cancellationToken);
}
