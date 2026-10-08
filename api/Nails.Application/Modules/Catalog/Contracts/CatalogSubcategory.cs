namespace Nails.Application.Modules.Catalog.Contracts;

public sealed record CatalogSubcategory(string Id, string CategoryId, string Name, bool Addon, IReadOnlyList<string> Synonyms);
