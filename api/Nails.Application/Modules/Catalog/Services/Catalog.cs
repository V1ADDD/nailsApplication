using Nails.Application.Modules.Catalog.Contracts;

namespace Nails.Application.Modules.Catalog.Services;

public sealed class Catalog : ICatalog
{
    private const string UnknownService = "Услуга";

    private readonly Dictionary<string, CatalogCategory> _categories =
        CatalogData.Categories.ToDictionary(category => category.Id, StringComparer.Ordinal);

    private readonly Dictionary<string, CatalogSubcategory> _subcategories =
        CatalogData.Categories.SelectMany(category => category.Subcategories).ToDictionary(sub => sub.Id, StringComparer.Ordinal);

    public IReadOnlyList<CatalogCategory> Categories => CatalogData.Categories;

    public CatalogCategory? FindCategory(string id) => _categories.GetValueOrDefault(id);

    public CatalogSubcategory? FindSubcategory(string id) => _subcategories.GetValueOrDefault(id);

    public CatalogCategory? CategoryOf(string subcategoryId) =>
        FindSubcategory(subcategoryId) is { } sub ? FindCategory(sub.CategoryId) : null;

    public string SubcategoryName(string id) => FindSubcategory(id)?.Name ?? UnknownService;
}
