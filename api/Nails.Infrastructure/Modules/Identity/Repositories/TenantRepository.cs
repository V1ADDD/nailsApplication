using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Identity.Repositories;

public sealed class TenantRepository(AppDbContext dbContext) : ITenantRepository
{
    public Task<bool> AnyAsync(CancellationToken cancellationToken) => dbContext.Set<Tenant>().AnyAsync(cancellationToken);

    public void Add(Tenant tenant) => dbContext.Set<Tenant>().Add(tenant);
}
