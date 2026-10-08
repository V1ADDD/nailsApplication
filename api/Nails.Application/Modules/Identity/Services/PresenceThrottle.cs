using System.Collections.Concurrent;

namespace Nails.Application.Modules.Identity.Services;

public sealed class PresenceThrottle
{
    private readonly ConcurrentDictionary<Guid, DateTimeOffset> _lastTouch = new();

    public bool TryEnter(Guid userId, DateTimeOffset now, TimeSpan interval)
    {
        var previous = _lastTouch.GetValueOrDefault(userId, DateTimeOffset.MinValue);

        if (now - previous < interval)
        {
            return false;
        }

        _lastTouch[userId] = now;
        return true;
    }
}
