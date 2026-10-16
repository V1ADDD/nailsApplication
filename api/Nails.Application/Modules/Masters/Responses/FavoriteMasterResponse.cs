namespace Nails.Application.Modules.Masters.Responses;

public sealed record FavoriteMasterResponse(
    Guid Id,
    string Name,
    string? PhotoUrl,
    string Specialty,
    double? Rating,
    int ReviewsCount,
    bool Verified);
