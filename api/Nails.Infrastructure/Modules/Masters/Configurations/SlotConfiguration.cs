using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Configurations;

public sealed class SlotConfiguration : IEntityTypeConfiguration<Slot>
{
    public void Configure(EntityTypeBuilder<Slot> builder)
    {
        builder.ToTable("slots", DatabaseSchemas.Masters);
        builder.HasKey(slot => slot.Id);
        builder.HasIndex(slot => new { slot.MasterId, slot.StartAt });
        builder.HasIndex(slot => new { slot.Status, slot.StartAt });
        builder.Property(slot => slot.Status).HasConversion<string>().HasMaxLength(MastersColumns.EnumMaxLength);
        builder.Property(slot => slot.Version).IsConcurrencyToken();
    }
}
