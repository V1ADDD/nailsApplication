namespace Nails.Infrastructure.Modules.Catalog.Entities;

public sealed class BeautyService
{
    public string Id { get; set; } = string.Empty;

    public string CategoryId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
