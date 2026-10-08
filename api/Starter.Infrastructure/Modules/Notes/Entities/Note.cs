using Starter.Infrastructure.Common;
using Starter.Infrastructure.Persistence.Contracts;

namespace Starter.Infrastructure.Modules.Notes.Entities;

public sealed class Note : ITenantEntity, IAuditable, IVersioned
{
    public const int TitleMaxLength = 200;

    public const int ContentMaxLength = 20000;

    public Guid Id { get; set; }

    public Guid TenantId { get; set; }

    public Guid AuthorId { get; set; }

    public string Title { get; private set; } = string.Empty;

    public string NormalizedTitle { get; private set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public long Version { get; set; }

    public void Rename(string title)
    {
        Title = title.Trim();
        NormalizedTitle = TextNormalizer.Normalize(title);
    }
}
