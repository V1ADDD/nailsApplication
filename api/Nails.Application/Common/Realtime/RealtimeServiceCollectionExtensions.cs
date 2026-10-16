using Microsoft.Extensions.DependencyInjection;

namespace Nails.Application.Common.Realtime;

public static class RealtimeServiceCollectionExtensions
{
    public static IServiceCollection AddRealtimeEvent<TPayload>(this IServiceCollection services) =>
        services.AddSingleton(new RealtimeEventType(typeof(TPayload)));
}
