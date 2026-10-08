using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;
using Starter.Application.Common.Exceptions;
using Starter.Application.Modules.Identity.Options;

namespace Starter.Api.Host.Extensions;

public static class RateLimitingExtensions
{
    public const string IdentityPolicy = "identity";

    private const string RateLimitedTitle = "Too many requests. Try again in a minute.";

    public static IServiceCollection AddStarterRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.AddPolicy(IdentityPolicy, context =>
            {
                var limits = context.RequestServices.GetRequiredService<IOptions<SignInLimitOptions>>().Value;

                return RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? string.Empty,
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = limits.PermitLimit,
                        Window = limits.Window,
                        QueueLimit = 0
                    });
            });

            options.OnRejected = (context, _) => new ValueTask(context.HttpContext.WriteProblemAsync(
                StatusCodes.Status429TooManyRequests,
                ErrorCodes.RateLimited,
                RateLimitedTitle));
        });

        return services;
    }
}
