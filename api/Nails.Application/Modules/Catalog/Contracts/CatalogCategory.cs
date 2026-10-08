namespace Nails.Application.Modules.Catalog.Contracts;

public sealed record CatalogCategory(
    string Id,
    string Name,
    string Specialty,
    IReadOnlyList<string> Synonyms,
    IReadOnlyList<CatalogSubcategory> Subcategories);
