using Nails.Application.Modules.Identity.Requests;
using Nails.Application.Modules.Identity.Responses;

namespace Nails.Application.Modules.Identity.Contracts;

public interface ISessionService
{
    Task<PhoneCodeResponse> RequestCodeAsync(PhoneCodeRequest request, CancellationToken cancellationToken);

    Task<SignInResponse> SignInAsync(SignInRequest request, CancellationToken cancellationToken);

    Task SignOutAsync();

    Task<MeResponse> MeAsync(CancellationToken cancellationToken);
}
