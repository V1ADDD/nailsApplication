using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Catalog.Responses;
using Nails.Application.Modules.Catalog.Rules;

namespace Nails.Application.Modules.Catalog.Services;

public sealed class CatalogService(ICatalog catalog) : ICatalogService
{
    private const int MinQueryLength = 2;
    private const int MaxSuggestions = 6;

    public IReadOnlyList<CategoryResponse> Categories() =>
    [
        .. catalog.Categories.Select(category => new CategoryResponse(
            category.Id,
            category.Name,
            category.Specialty,
            [.. category.Subcategories.Select(sub => new SubcategoryResponse(sub.Id, sub.Name, sub.Addon))]))
    ];

    public IReadOnlyList<SuggestionResponse> Suggestions(string? query)
    {
        var normalized = TextSearch.Normalize(query);

        if (normalized.Length < MinQueryLength)
        {
            return [];
        }

        var entries = catalog.Categories
            .SelectMany(category => new[]
                {
                    (Response: new SuggestionResponse(SuggestionKind.Category, category.Id, category.Name, category.Id, category.Name), category.Synonyms)
                }
                .Concat(category.Subcategories.Select(sub =>
                    (Response: new SuggestionResponse(SuggestionKind.Subcategory, sub.Id, sub.Name, category.Id, category.Name), sub.Synonyms))))
            .ToList();

        var exact = entries.Where(entry => TextSearch.Normalize(entry.Response.Name).Contains(normalized, StringComparison.Ordinal)).ToList();
        var fuzzy = entries
            .Except(exact)
            .Where(entry => TextSearch.FuzzyIncludes(entry.Response.Name, normalized)
                || entry.Synonyms.Any(synonym => TextSearch.FuzzyIncludes(synonym, normalized)));

        return [.. exact.Concat(fuzzy).Select(entry => entry.Response).Take(MaxSuggestions)];
    }
}
