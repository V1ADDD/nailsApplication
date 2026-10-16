using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Nails.Application.Modules.Identity.Contracts;

namespace Nails.Api.Host.Realtime;

[Authorize]
public sealed class AppHub(IPresence presence, HubRealtimeConnections connections) : Hub
{
    public override async Task OnConnectedAsync()
    {
        if (Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            connections.Add(userId, Context);
        }

        await TouchAsync();
        await base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        if (Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            connections.Remove(userId, Context.ConnectionId);
        }

        return base.OnDisconnectedAsync(exception);
    }

    public Task Heartbeat() => TouchAsync();

    private Task TouchAsync() =>
        Guid.TryParse(Context.UserIdentifier, out var userId)
            ? presence.TouchAsync(userId, Context.ConnectionAborted)
            : Task.CompletedTask;
}
