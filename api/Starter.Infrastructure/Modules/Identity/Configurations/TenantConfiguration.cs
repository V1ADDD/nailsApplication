using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Starter.Infrastructure.Modules.Identity.Entities;
using Starter.Infrastructure.Persistence;

namespace Starter.Infrastructure.Modules.Identity.Configurations;

public sealed class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("tenants", DatabaseSchemas.Identity);
        builder.HasKey(tenant => tenant.Id);
        builder.Property(tenant => tenant.Name).HasMaxLength(Tenant.NameMaxLength);
    }
}
