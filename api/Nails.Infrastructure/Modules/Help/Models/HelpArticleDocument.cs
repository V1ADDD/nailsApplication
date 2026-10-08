namespace Nails.Infrastructure.Modules.Help.Models;

public sealed record HelpArticleDocument(
    string Id,
    string Title,
    string? Summary,
    int Order,
    IReadOnlyList<string>? Keywords,
    IReadOnlyList<HelpBlockDocument>? Blocks);
