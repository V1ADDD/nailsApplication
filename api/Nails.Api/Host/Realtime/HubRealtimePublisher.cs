using Microsoft.AspNetCore.SignalR;
using Nails.Application.Common.Realtime;

namespace Nails.Api.Host.Realtime;

public sealed partial class HubRealtimePublisher(IHubContext<AppHub> hub, ILogger<HubRealtimePublisher> logger) : IRealtimePublisher
{
    public async Task ToUsersAsync(IReadOnlyCollection<Guid> userIds, string eventName, object payload, CancellationToken cancellationToken)
    {
        try
        {
            await hub.Clients.Users([.. userIds.Distinct().Select(id => id.ToString())]).SendAsync(eventName, payload, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            LogSendFailed(logger, exception, eventName);
        }
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Realtime event {EventName} could not be sent")]
    private static partial void LogSendFailed(ILogger logger, Exception exception, string eventName);
}
