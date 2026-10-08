using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class MasterService : IAuditable
{
    public const int SubcategoryMaxLength = 40;

    public Guid Id { get; set; }

    public Guid MasterId { get; set; }

    public string SubcategoryId { get; set; } = string.Empty;

    public PriceKind PriceKind { get; set; }

    public decimal? PriceAmount { get; set; }

    public int DurationMin { get; set; }

    public int SortOrder { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
