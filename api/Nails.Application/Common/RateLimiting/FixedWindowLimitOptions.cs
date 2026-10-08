using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Common.RateLimiting;

public abstract class FixedWindowLimitOptions
{
    [Range(1, 100000)]
    public int PermitLimit { get; set; }

    [Range(typeof(TimeSpan), "00:00:01", "01:00:00")]
    public TimeSpan Window { get; set; }
}
