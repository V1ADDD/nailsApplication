using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Identity.Options;

public sealed class SignInLimitOptions
{
    public const string SectionName = "Modules:Identity:RateLimit";

    [Range(1, 100000)]
    public int PermitLimit { get; set; }

    [Range(typeof(TimeSpan), "00:00:01", "01:00:00")]
    public TimeSpan Window { get; set; }
}
