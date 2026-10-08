namespace Starter.Infrastructure.Modules.Help.Models;

public sealed record HelpArticleFile(string Module, IReadOnlyList<HelpArticle> Articles);
