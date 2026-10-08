using Starter.Application.Modules.Identity.Requests;
using Starter.Application.Modules.Identity.Responses;

namespace Starter.Application.Modules.Identity.Contracts;

public interface IAccountService
{
    Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);

    Task ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken);

    Task ResendConfirmationAsync(EmailRequest request, CancellationToken cancellationToken);

    Task ForgotPasswordAsync(EmailRequest request, CancellationToken cancellationToken);

    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
}
