using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Starter.Infrastructure.Common;

public static class OptionsServiceCollectionExtensions
{
    public static IServiceCollection AddValidatedOptions<TOptions>(
        this IServiceCollection services,
        IConfiguration configuration,
        string sectionName)
        where TOptions : class
    {
        var builder = services.AddOptions<TOptions>()
            .Bind(configuration.GetSection(sectionName))
            .ValidateDataAnnotations();

        if (!BuildContext.IsGeneratingOpenApiDocument)
        {
            builder.ValidateOnStart();
        }

        return services;
    }
}
