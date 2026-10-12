using Nails.Application.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Contracts;

namespace Nails.Application.Modules.Identity.Services;

public sealed class AccountDirectory(IAccountDirectoryRepository accounts) : IAccountDirectory
{
    public Task<IReadOnlyDictionary<Guid, string>> NamesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken) =>
        accounts.NamesAsync([.. userIds.Distinct()], cancellationToken);
}
