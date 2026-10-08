using Starter.Infrastructure.Modules.Identity.Entities;

namespace Starter.Infrastructure.Modules.Identity.Contracts;

public interface ITenantRepository
{
    Task<bool> AnyAsync(CancellationToken cancellationToken);

    Task<string?> FindNameAsync(Guid id, CancellationToken cancellationToken);

    void Add(Tenant tenant);
}
