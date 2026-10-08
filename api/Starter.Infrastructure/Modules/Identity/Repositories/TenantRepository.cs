using Microsoft.EntityFrameworkCore;
using Starter.Infrastructure.Modules.Identity.Contracts;
using Starter.Infrastructure.Modules.Identity.Entities;
using Starter.Infrastructure.Persistence;

namespace Starter.Infrastructure.Modules.Identity.Repositories;

public sealed class TenantRepository(AppDbContext dbContext) : ITenantRepository
{
    public Task<bool> AnyAsync(CancellationToken cancellationToken) => dbContext.Set<Tenant>().AnyAsync(cancellationToken);

    public Task<string?> FindNameAsync(Guid id, CancellationToken cancellationToken) =>
        dbContext.Set<Tenant>()
            .AsNoTracking()
            .Where(tenant => tenant.Id == id)
            .Select(tenant => tenant.Name)
            .SingleOrDefaultAsync(cancellationToken);

    public void Add(Tenant tenant) => dbContext.Set<Tenant>().Add(tenant);
}
