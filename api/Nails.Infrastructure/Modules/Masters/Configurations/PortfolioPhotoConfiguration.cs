using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Configurations;

public sealed class PortfolioPhotoConfiguration : IEntityTypeConfiguration<PortfolioPhoto>
{
    public void Configure(EntityTypeBuilder<PortfolioPhoto> builder)
    {
        builder.ToTable("portfolio_photos", DatabaseSchemas.Masters);
        builder.HasKey(photo => photo.Id);
        builder.HasIndex(photo => photo.MasterId);
        builder.Property(photo => photo.Url).HasMaxLength(Master.UrlMaxLength);
        builder.Property(photo => photo.Caption).HasMaxLength(PortfolioPhoto.CaptionMaxLength);
    }
}
