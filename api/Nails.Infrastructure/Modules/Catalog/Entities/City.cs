namespace Nails.Infrastructure.Modules.Catalog.Entities;

public sealed class City
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
