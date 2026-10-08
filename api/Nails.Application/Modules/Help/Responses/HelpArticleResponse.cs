namespace Nails.Application.Modules.Help.Responses;

public sealed record HelpArticleResponse(
    string Id,
    string Title,
    string? Summary,
    IReadOnlyList<string> Keywords,
    IReadOnlyList<HelpBlockResponse> Blocks);
