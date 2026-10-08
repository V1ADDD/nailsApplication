using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Starter.Application.Common.Modules;
using Starter.Application.Modules.Identity.Contracts;
using Starter.Application.Modules.Identity.Options;
using Starter.Application.Modules.Identity.Services;
using Starter.Infrastructure.Common;
using Starter.Infrastructure.Modules.Identity.Contracts;
using Starter.Infrastructure.Modules.Identity.Entities;
using Starter.Infrastructure.Modules.Identity.Repositories;
using Starter.Infrastructure.Persistence;

namespace Starter.Application.Modules.Identity;

public sealed class IdentityModule : IAppModule
{
    private const string IdentitySection = "Modules:Identity:Options";
    private const string CookieSection = "Modules:Identity:Cookie";

    public string Name => "Identity";

    public bool AlwaysOn => true;

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<LinkTokenOptions>(configuration, LinkTokenOptions.SectionName);
        services.AddValidatedOptions<RegistrationOptions>(configuration, RegistrationOptions.SectionName);
        services.AddValidatedOptions<BootstrapOptions>(configuration, BootstrapOptions.SectionName);
        services.AddValidatedOptions<SignInLimitOptions>(configuration, SignInLimitOptions.SectionName);

        services.AddAuthentication(IdentityConstants.ApplicationScheme).AddIdentityCookies();

        services.AddIdentityCore<ApplicationUser>(options => configuration.GetSection(IdentitySection).Bind(options))
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders()
            .AddClaimsPrincipalFactory<TenantClaimsPrincipalFactory>();

        services.ConfigureApplicationCookie(options =>
        {
            configuration.GetSection(CookieSection).Bind(options);
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.Events = new CookieAuthenticationEvents
            {
                OnRedirectToLogin = context => Status(context, StatusCodes.Status401Unauthorized),
                OnRedirectToAccessDenied = context => Status(context, StatusCodes.Status403Forbidden)
            };
        });

        services.AddOptions<DataProtectionTokenProviderOptions>()
            .Configure<IOptions<LinkTokenOptions>>((options, tokens) => options.TokenLifespan = tokens.Value.TokenLifespan);

        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<CurrentUser>();
        services.AddScoped<ICurrentUser>(provider => provider.GetRequiredService<CurrentUser>());
        services.AddScoped<UserFactory>();
        services.AddScoped<ISessionService, SessionService>();
        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<IIdentityBootstrapper, IdentityBootstrapper>();
    }

    private static Task Status(RedirectContext<CookieAuthenticationOptions> context, int status)
    {
        context.Response.StatusCode = status;
        return Task.CompletedTask;
    }
}
