namespace Nails.Application.Modules.Catalog.Contracts;

public interface ICatalog
{
    IReadOnlyList<CatalogCategory> Categories { get; }

    CatalogCategory? FindCategory(string id);

    CatalogSubcategory? FindSubcategory(string id);

    CatalogCategory? CategoryOf(string subcategoryId);

    string SubcategoryName(string id);
}
