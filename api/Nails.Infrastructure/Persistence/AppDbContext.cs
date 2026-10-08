using System.Linq.Expressions;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options, ITenantProvider tenantProvider)
    : IdentityUserContext<ApplicationUser, Guid>(options), IDataProtectionKeyContext
{
    private const string TenantFilter = "tenant";

    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    public Guid CurrentTenantId => tenantProvider.TenantId;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (!typeof(ITenantEntity).IsAssignableFrom(entityType.ClrType))
            {
                continue;
            }

            var entity = Expression.Parameter(entityType.ClrType, "entity");
            var entityTenant = Expression.Property(entity, nameof(ITenantEntity.TenantId));
            var currentTenant = Expression.Property(Expression.Constant(this), nameof(CurrentTenantId));
            var filter = Expression.Lambda(Expression.Equal(entityTenant, currentTenant), entity);
            builder.Entity(entityType.ClrType).HasQueryFilter(TenantFilter, filter);
        }
    }
}
