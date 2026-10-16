using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Masters.Options;

public sealed class CitiesOptions
{
    public const string SectionName = "Modules:Masters:Cities";

    [MinLength(1)]
    public List<CityOptions> Items { get; set; } = [];
}
