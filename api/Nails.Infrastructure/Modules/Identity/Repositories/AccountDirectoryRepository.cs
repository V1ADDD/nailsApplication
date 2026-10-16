using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Identity.Repositories;

public sealed class AccountDirectoryRepository(AppDbContext dbContext) : IAccountDirectoryRepository
{
    public async Task<IReadOnlyDictionary<Guid, string>> NamesAsync(
        IReadOnlyCollection<Guid> userIds,
        CancellationToken cancellationToken)
    {
        if (userIds.Count == 0)
        {
            return new Dictionary<Guid, string>();
        }

        return await dbContext.Set<ApplicationUser>()
            .AsNoTracking()
            .Where(user => userIds.Contains(user.Id))
            .ToDictionaryAsync(user => user.Id, user => user.DisplayName, cancellationToken);
    }

    public Task<ApplicationUser?> FindAsync(Guid userId, CancellationToken cancellationToken) =>
        dbContext.Set<ApplicationUser>().AsNoTracking().FirstOrDefaultAsync(user => user.Id == userId, cancellationToken);

    public async Task<IReadOnlyDictionary<Guid, string>> PhonesAsync(
        IReadOnlyCollection<Guid> userIds,
        CancellationToken cancellationToken)
    {
        if (userIds.Count == 0)
        {
            return new Dictionary<Guid, string>();
        }

        return await dbContext.Set<ApplicationUser>()
            .AsNoTracking()
            .Where(user => userIds.Contains(user.Id) && user.PhoneNumber != null)
            .ToDictionaryAsync(user => user.Id, user => user.PhoneNumber!, cancellationToken);
    }
}
