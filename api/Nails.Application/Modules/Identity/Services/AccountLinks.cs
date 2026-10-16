using Nails.Application.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Contracts;

namespace Nails.Application.Modules.Identity.Services;

public sealed class AccountLinks(IAccountLinkRepository links) : IAccountLinks
{
    public Task SetMasterAsync(Guid userId, Guid masterId, CancellationToken cancellationToken) =>
        links.SetMasterAsync(userId, masterId, cancellationToken);
}
