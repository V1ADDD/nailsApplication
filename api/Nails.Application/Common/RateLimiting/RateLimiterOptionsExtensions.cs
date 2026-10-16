using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Nails.Application.Common.RateLimiting;

public static class RateLimiterOptionsExtensions
{
    public static RateLimiterOptions AddPerAddressPolicy<TOptions>(this RateLimiterOptions options, string policyName)
        where TOptions : FixedWindowLimitOptions =>
        options.AddFixedWindowPolicy<TOptions>(policyName, AddressOf);

    public static RateLimiterOptions AddPerUserPolicy<TOptions>(this RateLimiterOptions options, string policyName)
        where TOptions : FixedWindowLimitOptions =>
        options.AddFixedWindowPolicy<TOptions>(
            policyName,
            context => context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? AddressOf(context));

    private static RateLimiterOptions AddFixedWindowPolicy<TOptions>(
        this RateLimiterOptions options,
        string policyName,
        Func<HttpContext, string> partitionKey)
        where TOptions : FixedWindowLimitOptions
    {
        options.AddPolicy(policyName, context =>
        {
            var limits = context.RequestServices.GetRequiredService<IOptions<TOptions>>().Value;

            return RateLimitPartition.GetFixedWindowLimiter(
                partitionKey(context),
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limits.PermitLimit,
                    Window = limits.Window,
                    QueueLimit = 0
                });
        });

        return options;
    }

    private static string AddressOf(HttpContext context) => context.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
}
