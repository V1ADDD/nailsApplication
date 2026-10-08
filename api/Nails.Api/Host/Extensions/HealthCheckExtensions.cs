using Nails.Infrastructure.Persistence;

namespace Nails.Api.Host.Extensions;

public static class HealthCheckExtensions
{
    private const string Path = "/health";

    public static IServiceCollection AddNailsHealthChecks(this IServiceCollection services)
    {
        services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

        return services;
    }

    public static IEndpointRouteBuilder MapNailsHealthChecks(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHealthChecks(Path).AllowAnonymous();

        return endpoints;
    }
}
