namespace Nails.Infrastructure.Modules.Identity.Contracts;

public interface IAccountLinkRepository
{
    Task SetMasterAsync(Guid userId, Guid masterId, CancellationToken cancellationToken);
}
