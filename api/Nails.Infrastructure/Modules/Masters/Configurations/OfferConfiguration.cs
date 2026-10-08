using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Configurations;

public sealed class OfferConfiguration : IEntityTypeConfiguration<Offer>
{
    private const int PriceKindMaxLength = 10;

    public void Configure(EntityTypeBuilder<Offer> builder)
    {
        builder.ToTable("offers", DatabaseSchemas.Masters);
        builder.HasKey(offer => offer.Id);
        builder.Property(offer => offer.ServiceId).HasMaxLength(Offer.SlugMaxLength);
        builder.Property(offer => offer.CategoryId).HasMaxLength(Offer.SlugMaxLength);
        builder.Property(offer => offer.PriceKind).HasConversion<string>().HasMaxLength(PriceKindMaxLength);
        builder.Property(offer => offer.Price).HasPrecision(Offer.PricePrecision, Offer.PriceScale);
        builder.HasIndex(offer => new { offer.MasterId, offer.ServiceId }).IsUnique();
        builder.HasIndex(offer => new { offer.ServiceId, offer.Price });
        builder.HasIndex(offer => offer.CategoryId);
        builder.HasOne<MasterProfile>().WithMany().HasForeignKey(offer => offer.MasterId).OnDelete(DeleteBehavior.Cascade);
    }
}
