using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Identity.Configurations;

public sealed class UserClaimConfiguration : IEntityTypeConfiguration<IdentityUserClaim<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityUserClaim<Guid>> builder) =>
        builder.ToTable("user_claims", DatabaseSchemas.Identity);
}
