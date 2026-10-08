using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Identity.Configurations;

public sealed class PhoneCodeConfiguration : IEntityTypeConfiguration<PhoneCode>
{
    public void Configure(EntityTypeBuilder<PhoneCode> builder)
    {
        builder.ToTable("phone_codes", DatabaseSchemas.Identity);
        builder.HasKey(code => code.Id);
        builder.Property(code => code.Phone).HasMaxLength(PhoneCode.PhoneMaxLength);
        builder.Property(code => code.CodeHash).HasMaxLength(PhoneCode.CodeHashMaxLength);
        builder.HasIndex(code => code.Phone).IsUnique();
    }
}
