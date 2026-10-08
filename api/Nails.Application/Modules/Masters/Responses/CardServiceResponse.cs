namespace Nails.Application.Modules.Masters.Responses;

public sealed record CardServiceResponse(string SubcategoryId, string Name, PriceResponse Price, int DurationMin);
