using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Masters.Options;

public sealed class BookingOptions
{
    public const string SectionName = "Modules:Masters:Booking";

    [Range(1, 31)]
    public int SlotDays { get; set; }
}
