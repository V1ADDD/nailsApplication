using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Configurations;

public sealed class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("bookings", DatabaseSchemas.Masters);
        builder.HasKey(booking => booking.Id);
        builder.HasIndex(booking => new { booking.ClientUserId, booking.StartAt });
        builder.HasIndex(booking => new { booking.MasterId, booking.StartAt });
        builder.HasIndex(booking => new { booking.Status, booking.StartAt });
        builder.Property(booking => booking.ExternalClientName).HasMaxLength(Booking.ClientNameMaxLength);
        builder.Property(booking => booking.SubcategoryId).HasMaxLength(MasterService.SubcategoryMaxLength);
        builder.Property(booking => booking.PriceKind).HasConversion<string>().HasMaxLength(MastersColumns.EnumMaxLength);
        builder.Property(booking => booking.PriceAmount).HasPrecision(MastersColumns.PricePrecision, MastersColumns.PriceScale);
        builder.Property(booking => booking.Address).HasMaxLength(Master.AddressMaxLength);
        builder.Property(booking => booking.Status).HasConversion<string>().HasMaxLength(MastersColumns.EnumMaxLength);
        builder.Property(booking => booking.Source).HasConversion<string>().HasMaxLength(MastersColumns.EnumMaxLength);
        builder.Property(booking => booking.CreatedBy).HasConversion<string>().HasMaxLength(MastersColumns.EnumMaxLength);
        builder.Property(booking => booking.CancelledBy).HasConversion<string>().HasMaxLength(MastersColumns.EnumMaxLength);
        builder.Property(booking => booking.CancelReason).HasMaxLength(Booking.CancelReasonMaxLength);
        builder.Property(booking => booking.Note).HasMaxLength(Booking.NoteMaxLength);
        builder.Property(booking => booking.Version).IsConcurrencyToken();
    }
}
