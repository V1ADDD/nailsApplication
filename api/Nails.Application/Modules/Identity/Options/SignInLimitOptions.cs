using Nails.Application.Common.RateLimiting;

namespace Nails.Application.Modules.Identity.Options;

public sealed class SignInLimitOptions : FixedWindowLimitOptions
{
    public const string SectionName = "Modules:Identity:RateLimit";
}
