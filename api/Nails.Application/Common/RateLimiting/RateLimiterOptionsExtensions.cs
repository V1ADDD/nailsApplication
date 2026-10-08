using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Nails.Application.Common.RateLimiting;

public static class RateLimiterOptionsExtensions
{
    public static RateLimiterOptions AddPerAddressPolicy<TOptions>(this RateLimiterOptions options, string policyName)
        where TOptions : FixedWindowLimitOptions
    {
        options.AddPolicy(policyName, context =>
        {
            var limits = context.RequestServices.GetRequiredService<IOptions<TOptions>>().Value;

            return RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? string.Empty,
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limits.PermitLimit,
                    Window = limits.Window,
                    QueueLimit = 0
                });
        });

        return options;
    }
}
