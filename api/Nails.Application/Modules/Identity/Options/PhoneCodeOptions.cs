using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Identity.Options;

public sealed class PhoneCodeOptions
{
    public const string SectionName = "Modules:Identity:PhoneCode";

    [Range(4, 8)]
    public int Length { get; set; }

    [Range(typeof(TimeSpan), "00:01:00", "01:00:00")]
    public TimeSpan Lifetime { get; set; }

    [Range(typeof(TimeSpan), "00:00:10", "00:10:00")]
    public TimeSpan ResendInterval { get; set; }

    [Range(1, 20)]
    public int MaxAttempts { get; set; }
}
