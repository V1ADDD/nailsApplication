using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using Nails.Api.Host.Realtime;
using Nails.Application.Common.Realtime;
using Nails.Infrastructure.Common;

namespace Nails.Api.Host.Extensions;

public static class RealtimeExtensions
{
    private const string HubPath = "/" + ModuleRoutes.ApiPrefix + "/hub";

    public static IServiceCollection AddNailsRealtime(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<RealtimeOptions>(configuration, RealtimeOptions.SectionName);
        services.AddSignalR()
            .AddJsonProtocol(options => ControllerExtensions.ConfigureJson(options.PayloadSerializerOptions));
        services.AddOptions<HubOptions>()
            .Configure<IOptions<RealtimeOptions>>((hub, realtime) =>
            {
                hub.KeepAliveInterval = realtime.Value.KeepAliveInterval;
                hub.ClientTimeoutInterval = realtime.Value.ClientTimeoutInterval;
            });
        services.AddSingleton<IRealtimePublisher, HubRealtimePublisher>();

        return services;
    }

    public static IEndpointRouteBuilder MapNailsRealtime(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHub<AppHub>(HubPath, options => options.Transports = HttpTransportType.WebSockets);

        return endpoints;
    }
}
