namespace Nails.Application.Modules.Masters.Responses;

public sealed record MasterCardResponse(
    Guid Id,
    string Name,
    string? PhotoUrl,
    string Specialty,
    double? Rating,
    int ReviewsCount,
    int ExperienceYears,
    double DistanceKm,
    bool Online,
    bool Verified,
    bool IsFavorite,
    bool IsOwn,
    PriceResponse? HeadlinePrice,
    bool Narrowed,
    string? PreselectSubcategoryId,
    IReadOnlyList<CardServiceResponse> Services,
    DateTimeOffset? NextFreeSlotAt);
