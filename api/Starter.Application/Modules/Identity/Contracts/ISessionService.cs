using Starter.Application.Modules.Identity.Requests;
using Starter.Application.Modules.Identity.Responses;

namespace Starter.Application.Modules.Identity.Contracts;

public interface ISessionService
{
    Task SignInAsync(SignInRequest request, CancellationToken cancellationToken);

    Task SignOutAsync();

    Task<MeResponse> MeAsync(CancellationToken cancellationToken);
}
