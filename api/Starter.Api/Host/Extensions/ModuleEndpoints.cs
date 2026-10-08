using Starter.Application.Common.Modules;

namespace Starter.Api.Host.Extensions;

public static class ModuleEndpoints
{
    private const string Path = "/" + ModuleRoutes.ApiPrefix + "/modules";

    public static IEndpointRouteBuilder MapStarterModules(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet(Path, (ModuleRegistry registry) => TypedResults.Ok(new ModulesResponse(registry.EnabledKeys)))
            .AllowAnonymous()
            .WithName("GetModules");

        return endpoints;
    }
}
