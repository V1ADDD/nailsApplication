using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Persistence.Interceptors;

public sealed class TenantInterceptor(ITenantProvider tenantProvider) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        Stamp(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        Stamp(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void Stamp(DbContext? context)
    {
        if (context is null)
        {
            return;
        }

        var tenantId = tenantProvider.TenantId;

        foreach (var entry in context.ChangeTracker.Entries<ITenantEntity>())
        {
            if (entry.State is EntityState.Unchanged or EntityState.Detached)
            {
                continue;
            }

            if (tenantId == Guid.Empty)
            {
                throw new InvalidOperationException("No tenant is set for this unit of work.");
            }

            if (entry.State == EntityState.Added)
            {
                entry.Entity.TenantId = tenantId;
                continue;
            }

            if (entry.Entity.TenantId != tenantId)
            {
                throw new InvalidOperationException("An entity of another tenant cannot be changed.");
            }
        }
    }
}
