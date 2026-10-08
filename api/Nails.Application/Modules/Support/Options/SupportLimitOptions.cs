using Nails.Application.Common.RateLimiting;

namespace Nails.Application.Modules.Support.Options;

public sealed class SupportLimitOptions : FixedWindowLimitOptions
{
    public const string SectionName = "Modules:Support:RateLimit";
}
