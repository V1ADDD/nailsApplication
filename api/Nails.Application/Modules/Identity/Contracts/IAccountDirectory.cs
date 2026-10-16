namespace Nails.Application.Modules.Identity.Contracts;

public interface IAccountDirectory
{
    Task<IReadOnlyDictionary<Guid, string>> NamesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken);

    Task<IReadOnlyDictionary<Guid, string>> PhonesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken);

    Task<AccountProfile?> ProfileAsync(Guid userId, CancellationToken cancellationToken);
}
