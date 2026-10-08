using Microsoft.Extensions.Options;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Identity.Options;
using Nails.Infrastructure.Modules.Identity.Contracts;

namespace Nails.Application.Modules.Identity.Services;

public sealed class Presence(
    IUserPresenceRepository users,
    PresenceThrottle throttle,
    TimeProvider clock,
    IOptions<PresenceOptions> options) : IPresence
{
    public async Task<IReadOnlySet<Guid>> OnlineUsersAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken)
    {
        if (userIds.Count == 0)
        {
            return new HashSet<Guid>();
        }

        var since = clock.GetUtcNow() - options.Value.OnlineWindow;
        return (await users.SeenSinceAsync(userIds, since, cancellationToken)).ToHashSet();
    }

    public Task TouchAsync(Guid userId, CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow();
        return throttle.TryEnter(userId, now, options.Value.TouchInterval)
            ? users.MarkSeenAsync(userId, now, cancellationToken)
            : Task.CompletedTask;
    }
}
