using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Starter.Application.Common.Modules;
using Starter.Application.Common.Options;
using Starter.Application.Common.Tenancy;
using Starter.Infrastructure.Common;
using Starter.Infrastructure.Email;
using Starter.Infrastructure.Persistence;
using Starter.Infrastructure.Persistence.Contracts;

namespace Starter.Application.Common;

public static class ApplicationServiceCollectionExtensions
{
    public static ModuleRegistry AddStarterApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<TenantContext>();
        services.AddScoped<ITenantProvider>(provider => provider.GetRequiredService<TenantContext>());
        services.AddValidatedOptions<AppOptions>(configuration, AppOptions.SectionName);

        services.AddPersistence(configuration);
        services.AddEmail(configuration);

        return services.AddAppModules(configuration);
    }
}
