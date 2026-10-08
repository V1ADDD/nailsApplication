namespace Starter.Application.Modules.Help.Responses;

public sealed record HelpContentResponse(
    string Language,
    IReadOnlyList<string> Languages,
    HelpSiteResponse Site,
    HelpCompanyResponse Company,
    IReadOnlyList<HelpArticleResponse> Articles);
