using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Masters.Options;

public sealed class MyBookingsOptions
{
    public const string SectionName = "Modules:Masters:MyBookings";

    [Range(1, 100)]
    public int DefaultPageSize { get; set; }

    [Range(1, 100)]
    public int MaxPageSize { get; set; }
}
