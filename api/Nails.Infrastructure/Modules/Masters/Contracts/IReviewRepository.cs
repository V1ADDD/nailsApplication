using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IReviewRepository
{
    Task<bool> ExistsAsync(Guid bookingId, Party author, CancellationToken cancellationToken);

    void Add(Review review);

    Task<bool> SaveAsync(CancellationToken cancellationToken);

    Task<(int Written, int About)> CountsAsync(Guid clientUserId, CancellationToken cancellationToken);

    Task<Page<MyReviewRow>> PageAsync(Guid clientUserId, Party author, int page, int pageSize, CancellationToken cancellationToken);
}
