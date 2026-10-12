namespace Nails.Application.Modules.Masters.Responses;

public sealed record PortfolioPhotoResponse(Guid Id, string? Url, int Hue, string? Caption);
