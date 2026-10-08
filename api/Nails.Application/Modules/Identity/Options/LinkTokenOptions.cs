using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Identity.Options;

public sealed class LinkTokenOptions
{
    public const string SectionName = "Modules:Identity";

    [Range(typeof(TimeSpan), "00:05:00", "30.00:00:00")]
    public TimeSpan TokenLifespan { get; set; }
}
