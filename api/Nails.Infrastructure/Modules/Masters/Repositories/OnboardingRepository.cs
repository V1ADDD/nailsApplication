using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public sealed class OnboardingRepository(AppDbContext dbContext) : IOnboardingRepository
{
    public Task<bool> MasterExistsForUserAsync(Guid userId, CancellationToken cancellationToken) =>
        dbContext.Set<Master>().AnyAsync(master => master.UserId == userId, cancellationToken);

    public void Add(Master master, Schedule schedule)
    {
        dbContext.Set<Master>().Add(master);
        dbContext.Set<Schedule>().Add(schedule);
    }

    public async Task<bool> SaveAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException exception) when (DatabaseErrors.IsUniqueViolation(exception))
        {
            foreach (var entry in dbContext.ChangeTracker.Entries().Where(entry => entry.State == EntityState.Added).ToList())
            {
                entry.State = EntityState.Detached;
            }

            return false;
        }
    }
}
