using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Persistence;
using Nails.Infrastructure.Storage.Entities;

namespace Nails.Infrastructure.Storage.Configurations;

public sealed class MediaFileConfiguration : IEntityTypeConfiguration<MediaFile>
{
    public void Configure(EntityTypeBuilder<MediaFile> builder)
    {
        builder.ToTable("media_files", DatabaseSchemas.Platform);
        builder.HasKey(file => file.Id);
        builder.Property(file => file.ContentType).HasMaxLength(MediaFile.ContentTypeMaxLength);
        builder.Property(file => file.StorageKey).HasMaxLength(MediaFile.StorageKeyMaxLength);
        builder.HasIndex(file => file.OwnerUserId);
    }
}
