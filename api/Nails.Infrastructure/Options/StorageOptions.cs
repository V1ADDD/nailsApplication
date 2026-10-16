using System.ComponentModel.DataAnnotations;

namespace Nails.Infrastructure.Options;

public sealed class StorageOptions
{
    public const string SectionName = "Storage";

    [Required]
    public string RootPath { get; set; } = string.Empty;
}
