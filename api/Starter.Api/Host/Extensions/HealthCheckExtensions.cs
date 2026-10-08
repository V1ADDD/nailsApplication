using Starter.Infrastructure.Persistence;

namespace Starter.Api.Host.Extensions;

public static class HealthCheckExtensions
{
    private const string Path = "/health";

    public static IServiceCollection AddStarterHealthChecks(this IServiceCollection services)
    {
        services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

        return services;
    }

    public static IEndpointRouteBuilder MapStarterHealthChecks(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHealthChecks(Path).AllowAnonymous();

        return endpoints;
    }
}
