namespace Starter.Api.Host.Extensions;

public static class ModuleNamespace
{
    public const string Root = "Starter.Api.Modules";

    public static bool TryParse(Type type, out string module)
    {
        module = string.Empty;

        var name = type.Namespace;

        if (name is null || !name.StartsWith(Root + ".", StringComparison.Ordinal))
        {
            return false;
        }

        module = name[(Root.Length + 1)..].Split('.')[0];
        return module.Length > 0;
    }
}
