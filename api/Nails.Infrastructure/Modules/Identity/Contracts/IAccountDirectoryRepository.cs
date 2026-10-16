using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Infrastructure.Modules.Identity.Contracts;

public interface IAccountDirectoryRepository
{
    Task<IReadOnlyDictionary<Guid, string>> NamesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken);

    Task<IReadOnlyDictionary<Guid, string>> PhonesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken);

    Task<ApplicationUser?> FindAsync(Guid userId, CancellationToken cancellationToken);
}
