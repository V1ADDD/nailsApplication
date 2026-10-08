namespace Nails.Application.Modules.Catalog.Responses;

public sealed record CategoryResponse(string Id, string Name, IReadOnlyList<BeautyServiceResponse> Services);
