using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Common.Media;

public sealed class MediaOptions
{
    public const string SectionName = "Media";

    [Range(1, long.MaxValue)]
    public long MaxBytes { get; set; }

    [Range(0, int.MaxValue)]
    public int CacheSeconds { get; set; }

    [MinLength(1)]
    public string[] ContentTypes { get; set; } = [];
}
