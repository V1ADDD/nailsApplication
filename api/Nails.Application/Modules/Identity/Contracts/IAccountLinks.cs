namespace Nails.Application.Modules.Identity.Contracts;

public interface IAccountLinks
{
    Task SetMasterAsync(Guid userId, Guid masterId, CancellationToken cancellationToken);
}
