namespace Starter.Application.Modules.Help.Responses;

public sealed record HelpArticleResponse(string Id, string Module, string Title, string Summary, IReadOnlyList<string> Body);
