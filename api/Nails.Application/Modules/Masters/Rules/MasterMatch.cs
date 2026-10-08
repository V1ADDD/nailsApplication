using Nails.Application.Modules.Catalog.Rules;

namespace Nails.Application.Modules.Masters.Rules;

public sealed record MasterMatch(int Score, IReadOnlyList<string> SubcategoryIds)
{
    public const int None = 0;
    public const int Fuzzy = 1;
    public const int Exact = 2;

    public static MasterMatch For(IReadOnlyList<MatchableService> services, string profileText, string? query)
    {
        var normalized = TextSearch.Normalize(query);

        if (normalized.Length == 0)
        {
            return new MasterMatch(Exact, [.. services.Select(service => service.SubcategoryId)]);
        }

        var exact = new List<string>();
        var fuzzy = new List<string>();

        foreach (var service in services)
        {
            if (TextSearch.Normalize(service.Name).Contains(normalized, StringComparison.Ordinal))
            {
                exact.Add(service.SubcategoryId);
                continue;
            }

            string[] haystacks = [service.Name, .. service.Synonyms, service.CategoryName, .. service.CategorySynonyms];

            if (haystacks.Any(haystack => TextSearch.FuzzyIncludes(haystack, normalized)))
            {
                fuzzy.Add(service.SubcategoryId);
            }
        }

        if (exact.Count > 0)
        {
            return new MasterMatch(Exact, exact);
        }

        if (fuzzy.Count > 0)
        {
            return new MasterMatch(Fuzzy, fuzzy);
        }

        return TextSearch.FuzzyIncludes(profileText, normalized)
            ? new MasterMatch(Fuzzy, [.. services.Select(service => service.SubcategoryId)])
            : new MasterMatch(None, []);
    }
}
