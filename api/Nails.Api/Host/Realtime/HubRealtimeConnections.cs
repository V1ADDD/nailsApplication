using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using Nails.Application.Common.Realtime;

namespace Nails.Api.Host.Realtime;

public sealed class HubRealtimeConnections : IRealtimeConnections
{
    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, HubCallerContext>> _connections = new();

    public void Add(Guid userId, HubCallerContext context) =>
        _connections.GetOrAdd(userId, _ => new ConcurrentDictionary<string, HubCallerContext>())[context.ConnectionId] = context;

    public void Remove(Guid userId, string connectionId)
    {
        if (_connections.TryGetValue(userId, out var contexts))
        {
            contexts.TryRemove(connectionId, out _);
        }
    }

    public Task AbortAsync(Guid userId, CancellationToken cancellationToken)
    {
        if (_connections.TryRemove(userId, out var contexts))
        {
            foreach (var context in contexts.Values)
            {
                context.Abort();
            }
        }

        return Task.CompletedTask;
    }
}
