using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Configurations;

public sealed class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("reviews", DatabaseSchemas.Masters);
        builder.HasKey(review => review.Id);
        builder.HasIndex(review => new { review.BookingId, review.AuthorRole }).IsUnique();
        builder.HasIndex(review => new { review.MasterId, review.AuthorRole });
        builder.Property(review => review.AuthorRole).HasConversion<string>().HasMaxLength(MastersColumns.EnumMaxLength);
        builder.Property(review => review.SubcategoryId).HasMaxLength(MasterService.SubcategoryMaxLength);
        builder.Property(review => review.Text).HasMaxLength(Review.TextMaxLength);
    }
}
