using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Options;
using Nails.Infrastructure.Storage.Contracts;
using Nails.Infrastructure.Storage.Repositories;

namespace Nails.Infrastructure.Storage;

public static class StorageServiceCollectionExtensions
{
    public static IServiceCollection AddStorage(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<StorageOptions>(configuration, StorageOptions.SectionName);
        services.AddSingleton<IFileStorage, LocalFileStorage>();
        services.AddScoped<IMediaRepository, MediaRepository>();

        return services;
    }
}
