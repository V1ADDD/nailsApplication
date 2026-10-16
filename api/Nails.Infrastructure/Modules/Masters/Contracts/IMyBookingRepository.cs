using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Models;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IMyBookingRepository
{
    Task<Page<MyBookingRow>> PageAsync(
        Guid clientUserId,
        bool upcoming,
        DateTimeOffset now,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<MyBookingRow?> FindAsync(Guid bookingId, CancellationToken cancellationToken);
}
