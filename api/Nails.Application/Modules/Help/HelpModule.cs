using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nails.Application.Common.Modules;
using Nails.Application.Modules.Help.Contracts;
using Nails.Application.Modules.Help.Services;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Help.Contracts;
using Nails.Infrastructure.Modules.Help.Options;
using Nails.Infrastructure.Modules.Help.Repositories;

namespace Nails.Application.Modules.Help;

public sealed class HelpModule : IAppModule
{
    public string Name => "Help";

    public bool AlwaysOn => false;

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<HelpOptions>(configuration, HelpOptions.SectionName);
        services.AddSingleton<IHelpContentRepository, HelpContentRepository>();
        services.AddScoped<IHelpService, HelpService>();
    }
}
