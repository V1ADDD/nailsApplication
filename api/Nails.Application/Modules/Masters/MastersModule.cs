using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nails.Application.Common.Modules;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Options;
using Nails.Application.Modules.Masters.Services;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Repositories;

namespace Nails.Application.Modules.Masters;

public sealed class MastersModule : IAppModule
{
    public string Name => "Masters";

    public bool AlwaysOn => false;

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<MastersOptions>(configuration, MastersOptions.SectionName);
        services.AddScoped<IMasterRepository, MasterRepository>();
        services.AddScoped<IOfferRepository, OfferRepository>();
        services.AddScoped<IMasterSearchService, MasterSearchService>();
        services.AddScoped<IMyMasterService, MyMasterService>();
    }
}
