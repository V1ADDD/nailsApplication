using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Configurations;

public sealed class MasterProfileConfiguration : IEntityTypeConfiguration<MasterProfile>
{
    public void Configure(EntityTypeBuilder<MasterProfile> builder)
    {
        builder.ToTable("profiles", DatabaseSchemas.Masters);
        builder.HasKey(profile => profile.Id);
        builder.Property(profile => profile.DisplayName).HasMaxLength(MasterProfile.DisplayNameMaxLength);
        builder.Property(profile => profile.About).HasMaxLength(MasterProfile.AboutMaxLength);
        builder.Property(profile => profile.Phone).HasMaxLength(MasterProfile.PhoneMaxLength);
        builder.Property(profile => profile.CityId).HasMaxLength(Offer.SlugMaxLength);
        builder.Property(profile => profile.Address).HasMaxLength(MasterProfile.AddressMaxLength);
        builder.Property(profile => profile.Version).IsConcurrencyToken();
        builder.HasIndex(profile => profile.UserId).IsUnique();
        builder.HasIndex(profile => profile.CityId);
        builder.HasIndex(profile => profile.CreatedAt);
    }
}
