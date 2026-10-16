namespace Nails.Application.Common.Realtime;

public interface IRealtimeConnections
{
    Task AbortAsync(Guid userId, CancellationToken cancellationToken);
}
