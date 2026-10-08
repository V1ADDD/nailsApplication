using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Identity.Options;

public sealed class PresenceOptions
{
    public const string SectionName = "Modules:Identity:Presence";

    [Range(typeof(TimeSpan), "00:00:05", "00:10:00")]
    public TimeSpan TouchInterval { get; set; }

    [Range(typeof(TimeSpan), "00:01:00", "01:00:00")]
    public TimeSpan OnlineWindow { get; set; }
}
