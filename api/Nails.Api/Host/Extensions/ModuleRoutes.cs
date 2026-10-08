namespace Nails.Api.Host.Extensions;

public static class ModuleRoutes
{
    public const string ApiPrefix = "api";

    public static string For(string module) => $"{ApiPrefix}/{module.ToLowerInvariant()}";
}
