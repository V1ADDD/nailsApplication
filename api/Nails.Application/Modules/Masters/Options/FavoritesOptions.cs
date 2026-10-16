using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Masters.Options;

public sealed class FavoritesOptions
{
    public const string SectionName = "Modules:Masters:Favorites";

    [Range(1, 100)]
    public int DefaultPageSize { get; set; }

    [Range(1, 100)]
    public int MaxPageSize { get; set; }
}
