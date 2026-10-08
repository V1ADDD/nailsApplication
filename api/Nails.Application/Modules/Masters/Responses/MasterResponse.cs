namespace Nails.Application.Modules.Masters.Responses;

public sealed record MasterResponse(
    Guid Id,
    string DisplayName,
    string About,
    string Phone,
    string CityId,
    string CityName,
    string Address,
    long Version,
    IReadOnlyList<OfferResponse> Offers);
