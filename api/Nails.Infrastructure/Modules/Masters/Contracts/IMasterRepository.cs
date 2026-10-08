using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IMasterRepository
{
    Task<MasterProfile?> FindByUserAsync(Guid userId, CancellationToken cancellationToken);

    Task<Guid?> FindIdByUserAsync(Guid userId, CancellationToken cancellationToken);

    Task<MasterProfile?> FindPublicAsync(Guid id, CancellationToken cancellationToken);

    Task<Page<MasterProfile>> SearchAsync(MasterSearch search, CancellationToken cancellationToken);

    void Add(MasterProfile profile);
}
