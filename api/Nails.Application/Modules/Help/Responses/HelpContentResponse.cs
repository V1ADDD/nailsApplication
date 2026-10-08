namespace Nails.Application.Modules.Help.Responses;

public sealed record HelpContentResponse(
    HelpSiteResponse Site,
    HelpCompanyResponse Company,
    IReadOnlyList<HelpSectionResponse> Sections);
