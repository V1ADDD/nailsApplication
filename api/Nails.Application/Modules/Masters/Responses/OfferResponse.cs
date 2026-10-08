namespace Nails.Application.Modules.Masters.Responses;

public sealed record OfferResponse(
    Guid Id,
    string ServiceId,
    string ServiceName,
    string CategoryId,
    string CategoryName,
    PriceResponse Price,
    int DurationMinutes);
