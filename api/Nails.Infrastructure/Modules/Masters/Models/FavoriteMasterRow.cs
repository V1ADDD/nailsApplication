namespace Nails.Infrastructure.Modules.Masters.Models;

public sealed class FavoriteMasterRow
{
    public required Guid Id { get; init; }

    public required string Name { get; init; }

    public string? PhotoUrl { get; init; }

    public required string Specialty { get; init; }

    public required bool Verified { get; init; }

    public double? RatingAverage { get; init; }

    public required int ReviewsCount { get; init; }
}
