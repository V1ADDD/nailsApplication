namespace Nails.Application.Modules.Masters.Responses;

public sealed record MasterSummaryResponse(
    Guid Id,
    string DisplayName,
    string CityId,
    string CityName,
    IReadOnlyList<string> CategoryNames,
    PriceResponse HeadlinePrice,
    int OfferCount);
