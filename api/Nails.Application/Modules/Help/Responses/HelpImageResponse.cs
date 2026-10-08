namespace Nails.Application.Modules.Help.Responses;

public sealed record HelpImageResponse(string Url, string Alt, string? Caption, int Width, int Height);
