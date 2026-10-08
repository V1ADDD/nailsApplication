using Microsoft.Extensions.Configuration;

namespace Starter.Application.Common.Modules;

public sealed class ModuleRegistry
{
    private const string ModulesSection = "Modules";
    private const string EnabledKey = "Enabled";

    private readonly HashSet<string> _enabled;

    public ModuleRegistry(IConfiguration configuration, IReadOnlyList<IAppModule> modules)
    {
        EnabledModules = [.. modules
            .Where(module => module.AlwaysOn
                || configuration.GetValue<bool>($"{ModulesSection}:{module.Name}:{EnabledKey}"))];

        _enabled = EnabledModules
            .Select(module => module.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        EnabledKeys = [.. EnabledModules.Select(module => module.Name.ToLowerInvariant())];
    }

    public IReadOnlyList<IAppModule> EnabledModules { get; }

    public IReadOnlyList<string> EnabledKeys { get; }

    public bool IsEnabled(string name) => _enabled.Contains(name);
}
