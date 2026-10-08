using Nails.Application.Common.Exceptions;
using Nails.Application.Common.RateLimiting;
using Nails.Application.Modules.Identity.Options;

namespace Nails.Api.Host.Extensions;

public static class RateLimitingExtensions
{
    public const string IdentityPolicy = "identity";

    public static IServiceCollection AddNailsRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.AddPerAddressPolicy<SignInLimitOptions>(IdentityPolicy);

            options.OnRejected = (context, _) => new ValueTask(context.HttpContext.WriteProblemAsync(
                StatusCodes.Status429TooManyRequests,
                ErrorCodes.RateLimited,
                ProblemTitles.RateLimited));
        });

        return services;
    }
}
