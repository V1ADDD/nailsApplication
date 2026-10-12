using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Masters.Options;

public sealed class BookingTimeRulesOptions
{
    public const string SectionName = "Modules:Masters:TimeRules";

    [Range(typeof(TimeSpan), "00:00:05", "01:00:00")]
    public TimeSpan Interval { get; set; }
}
