using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nails.Application.Common.Media;
using Nails.Application.Common.Modules;
using Nails.Application.Common.Tenancy;
using Nails.Infrastructure.Email;
using Nails.Infrastructure.Persistence;
using Nails.Infrastructure.Persistence.Contracts;
using Nails.Infrastructure.Storage;

namespace Nails.Application.Common;

public static class ApplicationServiceCollectionExtensions
{
    public static ModuleRegistry AddNailsApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<TenantContext>();
        services.AddScoped<ITenantProvider>(provider => provider.GetRequiredService<TenantContext>());

        services.AddPersistence(configuration);
        services.AddEmail(configuration);
        services.AddStorage(configuration);
        services.AddMedia(configuration);

        return services.AddAppModules(configuration);
    }
}
