using Nails.Application.Modules.Identity.Requests;
using Nails.Application.Modules.Identity.Responses;

namespace Nails.Application.Modules.Identity.Contracts;

public interface ISessionService
{
    Task SignInAsync(SignInRequest request, CancellationToken cancellationToken);

    Task SignOutAsync();

    Task<MeResponse> MeAsync(CancellationToken cancellationToken);
}
