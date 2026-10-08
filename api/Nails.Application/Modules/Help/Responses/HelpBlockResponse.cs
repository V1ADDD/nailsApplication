namespace Nails.Application.Modules.Help.Responses;

public sealed record HelpBlockResponse(
    HelpBlockType Type,
    string? Text,
    HelpNoteTone? Tone,
    IReadOnlyList<string>? Items,
    IReadOnlyList<string>? ArticleIds,
    HelpImageResponse? Image);
