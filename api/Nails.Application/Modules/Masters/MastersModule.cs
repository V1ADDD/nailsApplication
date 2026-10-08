using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nails.Application.Common.Modules;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Options;
using Nails.Application.Modules.Masters.Services;
using Nails.Application.Modules.Masters.Seed;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Repositories;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Masters;

public sealed class MastersModule : IAppModule
{
    public string Name => "Masters";

    public bool AlwaysOn => false;

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<MasterSearchOptions>(configuration, MasterSearchOptions.SectionName);
        services.AddScoped<IMasterSearchRepository, MasterSearchRepository>();
        services.AddScoped<IFavoriteRepository, FavoriteRepository>();
        services.AddScoped<IMasterSearchService, MasterSearchService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<IDemoSeeder, MastersDemoSeeder>();
    }
}
