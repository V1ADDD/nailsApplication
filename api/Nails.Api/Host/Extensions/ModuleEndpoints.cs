using Nails.Application.Common.Modules;

namespace Nails.Api.Host.Extensions;

public static class ModuleEndpoints
{
    private const string Path = "/" + ModuleRoutes.ApiPrefix + "/modules";

    public static IEndpointRouteBuilder MapNailsModules(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet(Path, (ModuleRegistry registry) => TypedResults.Ok(new ModulesResponse(registry.EnabledKeys)))
            .AllowAnonymous()
            .WithName("GetModules");

        return endpoints;
    }
}
