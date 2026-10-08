namespace Nails.Application.Modules.Help.Responses;

public sealed record HelpSectionResponse(string Id, string Title, IReadOnlyList<HelpArticleResponse> Articles);
