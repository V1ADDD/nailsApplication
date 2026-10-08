using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Identity.Configurations;

public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    private const int RoleMaxLength = 20;

    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("users", DatabaseSchemas.Identity);
        builder.Property(user => user.DisplayName).HasMaxLength(ApplicationUser.DisplayNameMaxLength);
        builder.Property(user => user.Role).HasConversion<string>().HasMaxLength(RoleMaxLength);
        builder.HasIndex(user => user.TenantId);
        builder.HasOne<Tenant>().WithMany().HasForeignKey(user => user.TenantId).OnDelete(DeleteBehavior.Restrict);
    }
}
