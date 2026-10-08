namespace Starter.Infrastructure.Modules.Help.Models;

public sealed record HelpArticle(string Id, string Title, string Summary, IReadOnlyList<string> Body);
