using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Common.Realtime;

public sealed class RealtimeOptions
{
    public const string SectionName = "Realtime";

    [Range(typeof(TimeSpan), "00:00:01", "00:10:00")]
    public TimeSpan KeepAliveInterval { get; set; }

    [Range(typeof(TimeSpan), "00:00:02", "00:30:00")]
    public TimeSpan ClientTimeoutInterval { get; set; }
}
