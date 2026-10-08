using Nails.Application.Modules.Identity.Contracts;

namespace Nails.Application.Modules.Identity.Services;

public sealed class CurrentUser : ICurrentUser
{
    public Guid UserId { get; private set; }

    public void Set(Guid userId)
    {
        UserId = userId;
    }
}
