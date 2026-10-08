using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;
using Nails.Application.Common.Exceptions;
using Nails.Application.Modules.Identity.Options;

namespace Nails.Api.Host.Extensions;

public static class RateLimitingExtensions
{
    public const string IdentityPolicy = "identity";

    public static IServiceCollection AddNailsRateLimiting(this IServiceCollection services)
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
                ProblemTitles.RateLimited));
        });

        return services;
    }
}
