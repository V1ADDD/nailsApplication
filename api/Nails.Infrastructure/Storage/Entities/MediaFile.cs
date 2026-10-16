using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Storage.Entities;

public sealed class MediaFile : IAuditable
{
    public const int ContentTypeMaxLength = 20;
    public const int StorageKeyMaxLength = 200;

    public Guid Id { get; set; }

    public Guid OwnerUserId { get; set; }

    public string ContentType { get; set; } = string.Empty;

    public long SizeBytes { get; set; }

    public string StorageKey { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
