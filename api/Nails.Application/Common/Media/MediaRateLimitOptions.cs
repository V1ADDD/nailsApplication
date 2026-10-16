using Nails.Application.Common.RateLimiting;

namespace Nails.Application.Common.Media;

public sealed class MediaRateLimitOptions : FixedWindowLimitOptions
{
    public const string SectionName = "Media:RateLimit";
}
