using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Masters.Options;

public sealed class CityOptions
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Range(-90, 90)]
    public double Latitude { get; set; }

    [Range(-180, 180)]
    public double Longitude { get; set; }
}
