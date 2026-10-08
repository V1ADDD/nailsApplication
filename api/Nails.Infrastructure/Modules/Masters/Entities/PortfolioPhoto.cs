using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class PortfolioPhoto : IAuditable
{
    public const int CaptionMaxLength = 200;

    public Guid Id { get; set; }

    public Guid MasterId { get; set; }

    public string? Url { get; set; }

    public int Hue { get; set; }

    public string? Caption { get; set; }

    public int SortOrder { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
