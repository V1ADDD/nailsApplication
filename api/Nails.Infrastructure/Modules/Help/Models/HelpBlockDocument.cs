namespace Nails.Infrastructure.Modules.Help.Models;

public sealed record HelpBlockDocument(
    string Type,
    string? Text,
    string? Tone,
    IReadOnlyList<string>? Items,
    IReadOnlyList<string>? ArticleIds,
    string? File,
    string? Alt,
    string? Caption);
