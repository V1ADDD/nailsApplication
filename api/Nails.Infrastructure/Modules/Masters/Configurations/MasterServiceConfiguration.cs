using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Configurations;

public sealed class MasterServiceConfiguration : IEntityTypeConfiguration<MasterService>
{
    public void Configure(EntityTypeBuilder<MasterService> builder)
    {
        builder.ToTable("services", DatabaseSchemas.Masters);
        builder.HasKey(service => service.Id);
        builder.HasIndex(service => new { service.MasterId, service.SubcategoryId }).IsUnique();
        builder.Property(service => service.SubcategoryId).HasMaxLength(MasterService.SubcategoryMaxLength);
        builder.Property(service => service.PriceKind).HasConversion<string>().HasMaxLength(MastersColumns.EnumMaxLength);
        builder.Property(service => service.PriceAmount).HasPrecision(MastersColumns.PricePrecision, MastersColumns.PriceScale);
    }
}
