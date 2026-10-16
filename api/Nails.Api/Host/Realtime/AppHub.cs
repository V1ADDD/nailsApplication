using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Nails.Application.Modules.Identity.Contracts;

namespace Nails.Api.Host.Realtime;

[Authorize]
public sealed class AppHub(IPresence presence) : Hub
{
    public override async Task OnConnectedAsync()
    {
        await TouchAsync();
        await base.OnConnectedAsync();
    }

    public Task Heartbeat() => TouchAsync();

    private Task TouchAsync() =>
        Guid.TryParse(Context.UserIdentifier, out var userId)
            ? presence.TouchAsync(userId, Context.ConnectionAborted)
            : Task.CompletedTask;
}
