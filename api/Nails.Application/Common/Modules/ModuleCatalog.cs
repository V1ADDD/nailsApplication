using Nails.Application.Modules.Catalog;
using Nails.Application.Modules.Help;
using Nails.Application.Modules.Identity;
using Nails.Application.Modules.Masters;
using Nails.Application.Modules.Support;

namespace Nails.Application.Common.Modules;

public static class ModuleCatalog
{
    public static IReadOnlyList<IAppModule> All { get; } =
    [
        new IdentityModule(),
        new CatalogModule(),
        new HelpModule(),
        new MastersModule(),
        new SupportModule()
    ];
}
