using System.ComponentModel.DataAnnotations;

namespace Starter.Application.Common.Options;

public sealed class AppOptions
{
    public const string SectionName = "App";

    [Required]
    [Url]
    public string ClientUrl { get; set; } = string.Empty;
}
