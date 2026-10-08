namespace Nails.Infrastructure.Modules.Masters.Models;

public sealed class MasterCandidate
{
    public required Guid Id { get; init; }

    public required Guid UserId { get; init; }

    public required string Name { get; init; }

    public string? PhotoUrl { get; init; }

    public required string Specialty { get; init; }

    public required string City { get; init; }

    public required string District { get; init; }

    public required double Lat { get; init; }

    public required double Lng { get; init; }

    public required int ExperienceYears { get; init; }

    public required bool Verified { get; init; }

    public required bool ShowOnline { get; init; }

    public required IReadOnlyList<CandidateService> Services { get; init; }

    public double? RatingAverage { get; init; }

    public required int ReviewsCount { get; init; }

    public required int CompletedBookings { get; init; }

    public DateTimeOffset? NextFreeSlotAt { get; init; }
}
