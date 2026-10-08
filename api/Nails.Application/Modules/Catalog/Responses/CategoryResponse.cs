namespace Nails.Application.Modules.Catalog.Responses;

public sealed record CategoryResponse(string Id, string Name, string Specialty, IReadOnlyList<SubcategoryResponse> Subcategories);
