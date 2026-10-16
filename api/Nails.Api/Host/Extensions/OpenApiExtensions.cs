using Microsoft.AspNetCore.OpenApi;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using Nails.Api.Host.Options;
using Nails.Application.Common.Realtime;
using Nails.Infrastructure.Common;

namespace Nails.Api.Host.Extensions;

public static class OpenApiExtensions
{
    public static IServiceCollection AddNailsOpenApi(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<ApiDocsOptions>(configuration, ApiDocsOptions.SectionName);
        services.AddOpenApi(options => options.AddDocumentTransformer(AddRealtimeEventsAsync));

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

    private static async Task AddRealtimeEventsAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        foreach (var eventType in context.ApplicationServices.GetServices<RealtimeEventType>())
        {
            var schema = await context.GetOrCreateSchemaAsync(eventType.Payload, null, cancellationToken);
            document.AddComponent(eventType.Payload.Name, schema);
        }
    }
}
