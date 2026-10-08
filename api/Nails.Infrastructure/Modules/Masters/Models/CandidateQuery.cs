namespace Nails.Infrastructure.Modules.Masters.Models;

public sealed class CandidateQuery
{
    public required DateTimeOffset Now { get; init; }

    public IReadOnlyCollection<Guid>? MasterIds { get; init; }

    public string? City { get; init; }

    public (double MinLat, double MaxLat, double MinLng, double MaxLng)? Box { get; init; }

    public bool VerifiedOnly { get; init; }

    public (DateTimeOffset From, DateTimeOffset To)? FreeWindow { get; init; }

    public bool IncludeNextFreeSlot { get; init; }
}
