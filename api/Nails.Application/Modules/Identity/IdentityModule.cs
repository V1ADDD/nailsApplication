using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Nails.Application.Common.Modules;
using Nails.Application.Common.Realtime;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Identity.Options;
using Nails.Application.Modules.Identity.Responses;
using Nails.Application.Modules.Identity.Seed;
using Nails.Application.Modules.Identity.Services;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Modules.Identity.Integrations.Sms;
using Nails.Infrastructure.Modules.Identity.Options;
using Nails.Infrastructure.Modules.Identity.Repositories;
using Nails.Infrastructure.Persistence;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Identity;

public sealed class IdentityModule : IAppModule
{
    private const string IdentitySection = "Modules:Identity:Options";
    private const string CookieSection = "Modules:Identity:Cookie";

    public string Name => "Identity";

    public bool AlwaysOn => true;

    public IReadOnlyList<string> DependsOn => [];

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<PhoneCodeOptions>(configuration, PhoneCodeOptions.SectionName);
        services.AddValidatedOptions<SmsOptions>(configuration, SmsOptions.SectionName);
        services.AddValidatedOptions<SignInLimitOptions>(configuration, SignInLimitOptions.SectionName);
        services.AddValidatedOptions<PresenceOptions>(configuration, PresenceOptions.SectionName);
        services.AddValidatedOptions<SessionOptions>(configuration, SessionOptions.SectionName);
        services.AddOptions<SecurityStampValidatorOptions>()
            .Configure<IOptions<SessionOptions>>((validator, session) => validator.ValidationInterval = session.Value.StampValidationInterval);

        services.AddAuthentication(IdentityConstants.ApplicationScheme).AddIdentityCookies();

        services.AddIdentityCore<ApplicationUser>(options => configuration.GetSection(IdentitySection).Bind(options))
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager()
            .AddErrorDescriber<RussianIdentityErrorDescriber>()
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
                OnRedirectToAccessDenied = context => Status(context, StatusCodes.Status403Forbidden),
                OnValidatePrincipal = SecurityStampValidator.ValidatePrincipalAsync
            };
        });

        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<CurrentUser>();
        services.AddScoped<ICurrentUser>(provider => provider.GetRequiredService<CurrentUser>());
        services.AddScoped<UserFactory>();
        services.AddScoped<IPhoneCodeRepository, PhoneCodeRepository>();
        services.AddScoped<ISmsSender, EmailSmsSender>();
        services.AddScoped<ISessionService, SessionService>();
        services.AddSingleton<PresenceThrottle>();
        services.AddScoped<IUserPresenceRepository, UserPresenceRepository>();
        services.AddScoped<IPresence, Presence>();
        services.AddScoped<IAccountDirectoryRepository, AccountDirectoryRepository>();
        services.AddScoped<IAccountDirectory, AccountDirectory>();
        services.AddScoped<IUserModeRepository, UserModeRepository>();
        services.AddScoped<IPhoneChangeCodeRepository, PhoneChangeCodeRepository>();
        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<IAccountLinkRepository, AccountLinkRepository>();
        services.AddScoped<IAccountLinks, AccountLinks>();
        services.AddRealtimeEvent<ModeChangedEvent>();
        services.AddScoped<IDemoSeeder, IdentityDemoSeeder>();
    }

    private static Task Status(RedirectContext<CookieAuthenticationOptions> context, int status)
    {
        context.Response.StatusCode = status;
        return Task.CompletedTask;
    }
}
