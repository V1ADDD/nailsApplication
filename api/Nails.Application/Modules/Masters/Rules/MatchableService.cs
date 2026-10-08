namespace Nails.Application.Modules.Masters.Rules;

public sealed record MatchableService(
    string SubcategoryId,
    string Name,
    IReadOnlyList<string> Synonyms,
    string CategoryName,
    IReadOnlyList<string> CategorySynonyms);
