using Microsoft.Extensions.Options;
using Scalar.AspNetCore;
using Starter.Api.Host.Options;
using Starter.Infrastructure.Common;

namespace Starter.Api.Host.Extensions;

public static class OpenApiExtensions
{
    public static IServiceCollection AddStarterOpenApi(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<ApiDocsOptions>(configuration, ApiDocsOptions.SectionName);
        services.AddOpenApi();

        return services;
    }

    public static WebApplication UseStarterOpenApi(this WebApplication app)
    {
        if (app.Services.GetRequiredService<IOptions<ApiDocsOptions>>().Value.Enabled)
        {
            app.MapOpenApi().AllowAnonymous();
            app.MapScalarApiReference().AllowAnonymous();
        }

        return app;
    }
}
