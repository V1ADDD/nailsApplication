namespace Nails.Infrastructure.Modules.Help.Models;

public sealed record HelpSectionDocument(string Id, string Title, int Order, IReadOnlyList<HelpArticleDocument>? Articles);
