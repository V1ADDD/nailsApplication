namespace Nails.Application.Modules.Catalog.Responses;

public sealed record CatalogResponse(IReadOnlyList<CategoryResponse> Categories, IReadOnlyList<CityResponse> Cities);
