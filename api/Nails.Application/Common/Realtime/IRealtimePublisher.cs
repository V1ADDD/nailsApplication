namespace Nails.Application.Common.Realtime;

public interface IRealtimePublisher
{
    Task ToUsersAsync(IReadOnlyCollection<Guid> userIds, string eventName, object payload, CancellationToken cancellationToken);
}
