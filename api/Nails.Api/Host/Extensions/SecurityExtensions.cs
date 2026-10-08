using System.Net;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;
using Nails.Api.Host.Middleware;
using Nails.Api.Host.Options;
using Nails.Api.Host.Security;
using Nails.Infrastructure.Common;

namespace Nails.Api.Host.Extensions;

public static class SecurityExtensions
{
    public static IServiceCollection AddNailsSecurity(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<SecurityOptions>(configuration, SecurityOptions.SectionName);

        var security = configuration.GetSection(SecurityOptions.SectionName).Get<SecurityOptions>() ?? new SecurityOptions();

        services.AddAntiforgery(options =>
        {
            options.HeaderName = AntiforgeryDefaults.HeaderName;
            options.Cookie.Name = AntiforgeryDefaults.CookieName;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            options.Cookie.SameSite = SameSiteMode.Strict;
        });

        services.Configure<CookiePolicyOptions>(options =>
        {
            options.Secure = security.SecureCookies ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
            options.MinimumSameSitePolicy = SameSiteMode.Strict;
        });

        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.KnownProxies.Clear();
            options.KnownIPNetworks.Clear();

            foreach (var proxy in security.ForwardedHeaders.KnownProxies)
            {
                options.KnownProxies.Add(IPAddress.Parse(proxy));
            }

            foreach (var network in security.ForwardedHeaders.KnownNetworks)
            {
                options.KnownIPNetworks.Add(System.Net.IPNetwork.Parse(network));
            }
        });

        return services;
    }

    public static WebApplication UseNailsSecurity(this WebApplication app)
    {
        var security = app.Services.GetRequiredService<IOptions<SecurityOptions>>().Value;

        if (security.ForwardedHeaders.Enabled)
        {
            app.UseForwardedHeaders();
        }

        if (!app.Environment.IsDevelopment())
        {
            app.UseHsts();
        }

        if (security.RedirectToHttps)
        {
            app.UseHttpsRedirection();
        }

        app.UseCookiePolicy();
        app.UseMiddleware<SecurityHeadersMiddleware>();

        return app;
    }
}
