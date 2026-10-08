namespace Nails.Application.Modules.Identity.Contracts;

public interface IPresence
{
    Task<IReadOnlySet<Guid>> OnlineUsersAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken);

    Task TouchAsync(Guid userId, CancellationToken cancellationToken);
}
