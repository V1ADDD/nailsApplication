using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Infrastructure.Modules.Identity.Contracts;

public interface IUserModeRepository
{
    Task SetAsync(Guid userId, UserMode mode, CancellationToken cancellationToken);
}
