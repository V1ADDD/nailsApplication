using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Identity.Options;

public sealed class SessionOptions
{
    public const string SectionName = "Modules:Identity:Session";

    [Range(typeof(TimeSpan), "00:00:00", "01:00:00")]
    public TimeSpan StampValidationInterval { get; set; }
}
