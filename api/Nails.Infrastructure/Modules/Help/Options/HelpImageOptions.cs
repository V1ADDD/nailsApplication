using System.ComponentModel.DataAnnotations;

namespace Nails.Infrastructure.Modules.Help.Options;

public sealed class HelpImageOptions : IValidatableObject
{
    public const string SectionName = "Modules:Help:Images";

    private const char ExtensionMarker = '.';

    public Dictionary<string, string> ContentTypes { get; set; } = [];

    [Range(1, 10485760)]
    public long MaxBytes { get; set; }

    [Range(0, 31536000)]
    public int CacheSeconds { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (ContentTypes.Count == 0)
        {
            yield return new ValidationResult("At least one image content type is required.", [nameof(ContentTypes)]);
        }

        foreach (var (extension, contentType) in ContentTypes)
        {
            if (extension.Length < 2 || extension[0] != ExtensionMarker || string.IsNullOrWhiteSpace(contentType))
            {
                yield return new ValidationResult(
                    $"Image content type '{extension}' must start with '{ExtensionMarker}' and name a media type.",
                    [nameof(ContentTypes)]);
            }
        }
    }
}
