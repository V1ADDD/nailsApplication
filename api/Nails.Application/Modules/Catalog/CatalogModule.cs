using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nails.Application.Common.Modules;
using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Catalog.Services;
using Nails.Infrastructure.Modules.Catalog.Contracts;
using Nails.Infrastructure.Modules.Catalog.Repositories;

namespace Nails.Application.Modules.Catalog;

public sealed class CatalogModule : IAppModule
{
    public string Name => "Catalog";

    public bool AlwaysOn => true;

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ICatalogRepository, CatalogRepository>();
        services.AddScoped<ICatalogService, CatalogService>();
    }
}
