using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Configurations;

public sealed class MasterConfiguration : IEntityTypeConfiguration<Master>
{
    public void Configure(EntityTypeBuilder<Master> builder)
    {
        builder.ToTable("masters", DatabaseSchemas.Masters);
        builder.HasKey(master => master.Id);
        builder.HasIndex(master => master.UserId).IsUnique();
        builder.HasIndex(master => master.City);
        builder.HasIndex(master => master.DeletedAt);
        builder.HasIndex(master => new { master.Lat, master.Lng });
        builder.Property(master => master.Name).HasMaxLength(Master.NameMaxLength);
        builder.Property(master => master.PhotoUrl).HasMaxLength(Master.UrlMaxLength);
        builder.Property(master => master.Specialty).HasMaxLength(Master.SpecialtyMaxLength);
        builder.Property(master => master.City).HasMaxLength(Master.PlaceMaxLength);
        builder.Property(master => master.District).HasMaxLength(Master.PlaceMaxLength);
        builder.Property(master => master.Address).HasMaxLength(Master.AddressMaxLength);
        builder.Property(master => master.About).HasMaxLength(Master.AboutMaxLength);
        builder.Property(master => master.Phone).HasMaxLength(Master.PhoneMaxLength);
        builder.Property(master => master.Email).HasMaxLength(Master.EmailMaxLength);
        builder.Property(master => master.Telegram).HasMaxLength(Master.HandleMaxLength);
        builder.Property(master => master.Viber).HasMaxLength(Master.HandleMaxLength);
        builder.Property(master => master.Instagram).HasMaxLength(Master.HandleMaxLength);
        builder.Property(master => master.VerificationStatus).HasConversion<string>().HasMaxLength(MastersColumns.EnumMaxLength);
        builder.Property(master => master.Version).IsConcurrencyToken();
    }
}
