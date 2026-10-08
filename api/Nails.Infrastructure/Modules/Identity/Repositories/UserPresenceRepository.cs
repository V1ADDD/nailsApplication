using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Identity.Repositories;

public sealed class UserPresenceRepository(AppDbContext dbContext) : IUserPresenceRepository
{
    public async Task<IReadOnlyList<Guid>> SeenSinceAsync(
        IReadOnlyCollection<Guid> userIds,
        DateTimeOffset since,
        CancellationToken cancellationToken) =>
        await dbContext.Set<ApplicationUser>()
            .AsNoTracking()
            .Where(user => userIds.Contains(user.Id) && user.LastSeenAt >= since)
            .Select(user => user.Id)
            .ToListAsync(cancellationToken);

    public Task MarkSeenAsync(Guid userId, DateTimeOffset at, CancellationToken cancellationToken) =>
        dbContext.Set<ApplicationUser>()
            .Where(user => user.Id == userId && (user.LastSeenAt == null || user.LastSeenAt < at))
            .ExecuteUpdateAsync(setters => setters.SetProperty(user => user.LastSeenAt, at), cancellationToken);
}
