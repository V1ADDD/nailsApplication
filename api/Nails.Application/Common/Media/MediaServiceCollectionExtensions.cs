using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nails.Infrastructure.Common;

namespace Nails.Application.Common.Media;

public static class MediaServiceCollectionExtensions
{
    public static IServiceCollection AddMedia(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<MediaOptions>(configuration, MediaOptions.SectionName);
        services.AddValidatedOptions<MediaRateLimitOptions>(configuration, MediaRateLimitOptions.SectionName);
        services.AddScoped<IMediaService, MediaService>();
        services.AddScoped<IMediaOwnership, MediaOwnership>();

        return services;
    }
}
