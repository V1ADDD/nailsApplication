using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nails.Application.Common.Modules;
using Nails.Application.Common.RateLimiting;
using Nails.Application.Modules.Support.Contracts;
using Nails.Application.Modules.Support.Options;
using Nails.Application.Modules.Support.Services;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Support.Contracts;
using Nails.Infrastructure.Modules.Support.Repositories;

namespace Nails.Application.Modules.Support;

public sealed class SupportModule : IAppModule
{
    public const string RateLimitPolicy = "support";

    public string Name => "Support";

    public bool AlwaysOn => false;

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<SupportLimitOptions>(configuration, SupportLimitOptions.SectionName);
        services.Configure<RateLimiterOptions>(options => options.AddPerAddressPolicy<SupportLimitOptions>(RateLimitPolicy));
        services.AddScoped<ISupportTicketRepository, SupportTicketRepository>();
        services.AddScoped<ISupportTicketService, SupportTicketService>();
    }
}
