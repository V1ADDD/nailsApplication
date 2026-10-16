using Microsoft.Extensions.Configuration;

namespace Nails.Application.Common.Modules;

public sealed class ModuleRegistry
{
    private const string ModulesSection = "Modules";
    private const string EnabledKey = "Enabled";

    private readonly HashSet<string> _enabled;

    public ModuleRegistry(IConfiguration configuration, IReadOnlyList<IAppModule> modules)
    {
        var switchedOn = modules
            .Where(module => module.AlwaysOn
                || configuration.GetValue<bool>($"{ModulesSection}:{module.Name}:{EnabledKey}"))
            .ToDictionary(module => module.Name, StringComparer.OrdinalIgnoreCase);

        EnabledModules = [.. modules.Where(module => IsResolved(module, switchedOn, []))];

        _enabled = EnabledModules
            .Select(module => module.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        EnabledKeys = [.. EnabledModules.Select(module => module.Name.ToLowerInvariant())];
    }

    public IReadOnlyList<IAppModule> EnabledModules { get; }

    public IReadOnlyList<string> EnabledKeys { get; }

    public bool IsEnabled(string name) => _enabled.Contains(name);

    private static bool IsResolved(IAppModule module, Dictionary<string, IAppModule> switchedOn, HashSet<string> visiting)
    {
        if (!switchedOn.ContainsKey(module.Name) || !visiting.Add(module.Name))
        {
            return false;
        }

        var resolved = module.DependsOn.All(name =>
            switchedOn.TryGetValue(name, out var dependency) && IsResolved(dependency, switchedOn, visiting));

        visiting.Remove(module.Name);
        return resolved;
    }
}
