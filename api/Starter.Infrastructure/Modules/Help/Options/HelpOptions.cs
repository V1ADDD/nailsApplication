using System.ComponentModel.DataAnnotations;

namespace Starter.Infrastructure.Modules.Help.Options;

public sealed class HelpOptions
{
    public const string SectionName = "Modules:Help";

    [Required]
    public string DefaultLanguage { get; set; } = string.Empty;

    [Required]
    public string ContentPath { get; set; } = string.Empty;
}
