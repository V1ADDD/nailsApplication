using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Identity.Repositories;

public sealed class UserModeRepository(AppDbContext dbContext) : IUserModeRepository
{
    public Task SetAsync(Guid userId, UserMode mode, CancellationToken cancellationToken) =>
        dbContext.Set<ApplicationUser>()
            .Where(user => user.Id == userId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(user => user.ActiveMode, mode), cancellationToken);
}
