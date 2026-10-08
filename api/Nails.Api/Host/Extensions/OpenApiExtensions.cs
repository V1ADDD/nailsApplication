using Microsoft.Extensions.Options;
using Scalar.AspNetCore;
using Nails.Api.Host.Options;
using Nails.Infrastructure.Common;

namespace Nails.Api.Host.Extensions;

public static class OpenApiExtensions
{
    public static IServiceCollection AddNailsOpenApi(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<ApiDocsOptions>(configuration, ApiDocsOptions.SectionName);
        services.AddOpenApi();

        return services;
    }

    public static WebApplication UseNailsOpenApi(this WebApplication app)
    {
        if (app.Services.GetRequiredService<IOptions<ApiDocsOptions>>().Value.Enabled)
        {
            app.MapOpenApi().AllowAnonymous();
            app.MapScalarApiReference().AllowAnonymous();
        }

        return app;
    }
}
