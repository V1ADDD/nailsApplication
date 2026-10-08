using System.ComponentModel.DataAnnotations;

namespace Nails.Infrastructure.Options;

public sealed class DemoOptions
{
    public const string SectionName = "Demo";

    public bool Enabled { get; set; }

    [Required]
    public string PhotoUrlFormat { get; set; } = string.Empty;
}
