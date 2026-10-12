namespace Nails.Infrastructure.Modules.Identity.Contracts;

public interface IAccountDirectoryRepository
{
    Task<IReadOnlyDictionary<Guid, string>> NamesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken);
}
