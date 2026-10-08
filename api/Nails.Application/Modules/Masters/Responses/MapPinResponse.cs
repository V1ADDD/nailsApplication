namespace Nails.Application.Modules.Masters.Responses;

public sealed record MapPinResponse(Guid Id, double Lat, double Lng, PriceResponse? Price, string Specialty, bool Online);
