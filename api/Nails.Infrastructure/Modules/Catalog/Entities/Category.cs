namespace Nails.Infrastructure.Modules.Catalog.Entities;

public sealed class Category
{
    public const int IdMaxLength = 64;
    public const int NameMaxLength = 100;

    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
