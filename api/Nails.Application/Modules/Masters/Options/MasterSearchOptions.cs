using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Masters.Options;

public sealed class MasterSearchOptions
{
    public const string SectionName = "Modules:Masters:Search";

    [Range(1, 100)]
    public int DefaultPageSize { get; set; }

    [Range(1, 100)]
    public int MaxPageSize { get; set; }

    [Range(1, 10000)]
    public int PinLimit { get; set; }

    [Range(-90, 90)]
    public double DefaultLatitude { get; set; }

    [Range(-180, 180)]
    public double DefaultLongitude { get; set; }
}
