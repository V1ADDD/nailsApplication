namespace Nails.Infrastructure.Modules.Masters.Models;

public sealed record MasterSearch(string? CategoryId, string? ServiceId, string? CityId, int Page, int PageSize);
