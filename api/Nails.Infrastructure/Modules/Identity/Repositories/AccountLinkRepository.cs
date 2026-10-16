using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Identity.Repositories;

public sealed class AccountLinkRepository(AppDbContext dbContext) : IAccountLinkRepository
{
    public async Task SetMasterAsync(Guid userId, Guid masterId, CancellationToken cancellationToken)
    {
        await dbContext.Set<ApplicationUser>()
            .Where(user => user.Id == userId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(user => user.MasterId, masterId), cancellationToken);

        if (dbContext.Set<ApplicationUser>().Local.FirstOrDefault(user => user.Id == userId) is { } tracked)
        {
            dbContext.Entry(tracked).Property(user => user.MasterId).CurrentValue = masterId;
            dbContext.Entry(tracked).Property(user => user.MasterId).OriginalValue = masterId;
        }
    }
}
