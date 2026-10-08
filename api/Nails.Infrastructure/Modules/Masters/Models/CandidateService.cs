using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Infrastructure.Modules.Masters.Models;

public sealed class CandidateService
{
    public required string SubcategoryId { get; init; }

    public required PriceKind PriceKind { get; init; }

    public decimal? PriceAmount { get; init; }

    public required int DurationMin { get; init; }
}
