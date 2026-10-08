using Starter.Application.Modules.Help;
using Starter.Application.Modules.Identity;
using Starter.Application.Modules.Notes;

namespace Starter.Application.Common.Modules;

public static class ModuleCatalog
{
    public static IReadOnlyList<IAppModule> All { get; } =
    [
        new IdentityModule(),
        new HelpModule(),
        new NotesModule()
    ];
}
