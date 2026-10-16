using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IOnboardingRepository
{
    Task<bool> MasterExistsForUserAsync(Guid userId, CancellationToken cancellationToken);

    void Add(Master master, Schedule schedule);

    Task<bool> SaveAsync(CancellationToken cancellationToken);
}
