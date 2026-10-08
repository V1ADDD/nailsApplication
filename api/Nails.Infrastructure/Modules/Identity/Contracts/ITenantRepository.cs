using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Infrastructure.Modules.Identity.Contracts;

public interface ITenantRepository
{
    Task<bool> AnyAsync(CancellationToken cancellationToken);

    void Add(Tenant tenant);
}
