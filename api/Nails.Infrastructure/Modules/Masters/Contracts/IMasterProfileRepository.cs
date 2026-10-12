using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IMasterProfileRepository
{
    Task<MasterProfileRow?> FindAsync(Guid masterId, CancellationToken cancellationToken);

    Task<bool> ExistsAsync(Guid masterId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Slot>> SlotsAsync(Guid masterId, DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken);

    Task<Page<ReviewRow>> ReviewsAsync(Guid masterId, int page, int pageSize, CancellationToken cancellationToken);
}
