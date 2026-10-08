namespace Nails.Infrastructure.Modules.Identity.Contracts;

public interface IUserPresenceRepository
{
    Task<IReadOnlyList<Guid>> SeenSinceAsync(IReadOnlyCollection<Guid> userIds, DateTimeOffset since, CancellationToken cancellationToken);

    Task MarkSeenAsync(Guid userId, DateTimeOffset at, CancellationToken cancellationToken);
}
