namespace Nails.Application.Modules.Masters.Responses;

public sealed record ProfileServiceResponse(Guid Id, string SubcategoryId, string CategoryId, string Name, PriceResponse Price, int DurationMin);
