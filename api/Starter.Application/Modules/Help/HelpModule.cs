using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Starter.Application.Common.Modules;
using Starter.Application.Modules.Help.Contracts;
using Starter.Application.Modules.Help.Services;
using Starter.Infrastructure.Common;
using Starter.Infrastructure.Modules.Help.Contracts;
using Starter.Infrastructure.Modules.Help.Options;
using Starter.Infrastructure.Modules.Help.Repositories;

namespace Starter.Application.Modules.Help;

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
