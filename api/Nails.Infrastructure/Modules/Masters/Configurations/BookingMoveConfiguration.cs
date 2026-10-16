using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Configurations;

public sealed class BookingMoveConfiguration : IEntityTypeConfiguration<BookingMove>
{
    private const string OpenFilter = "\"status\" = 'Open'";

    public void Configure(EntityTypeBuilder<BookingMove> builder)
    {
        builder.ToTable("booking_moves", DatabaseSchemas.Masters);
        builder.HasKey(move => move.Id);
        builder.HasIndex(move => move.BookingId).IsUnique().HasFilter(OpenFilter);
        builder.HasIndex(move => new { move.Status, move.LapsesAt });
        builder.Property(move => move.Status).HasConversion<string>().HasMaxLength(MastersColumns.EnumMaxLength);
        builder.Property(move => move.Version).IsConcurrencyToken();
    }
}
