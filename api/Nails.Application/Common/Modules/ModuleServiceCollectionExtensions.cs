using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Nails.Application.Common.Modules;

public static class ModuleServiceCollectionExtensions
{
    public static ModuleRegistry AddAppModules(this IServiceCollection services, IConfiguration configuration)
    {
        var registry = new ModuleRegistry(configuration, ModuleCatalog.All);
        services.AddSingleton(registry);

        foreach (var module in registry.EnabledModules)
        {
            module.Register(services, configuration);
        }

        return registry;
    }
}
