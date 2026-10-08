using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Nails.Api.Host.Extensions;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Identity.Requests;
using Nails.Application.Modules.Identity.Responses;

namespace Nails.Api.Modules.Identity.Controllers;

[ApiController]
[Route("")]
[AllowAnonymous]
[EnableRateLimiting(RateLimitingExtensions.IdentityPolicy)]
public sealed class AccountController(IAccountService accounts) : ControllerBase
{
    [HttpPost("register")]
    public Task<RegisterResponse> Register(RegisterRequest request, CancellationToken cancellationToken) =>
        accounts.RegisterAsync(request, cancellationToken);

    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(ConfirmEmailRequest request, CancellationToken cancellationToken)
    {
        await accounts.ConfirmEmailAsync(request, cancellationToken);
        return NoContent();
    }

    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendConfirmation(EmailRequest request, CancellationToken cancellationToken)
    {
        await accounts.ResendConfirmationAsync(request, cancellationToken);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(EmailRequest request, CancellationToken cancellationToken)
    {
        await accounts.ForgotPasswordAsync(request, cancellationToken);
        return NoContent();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        await accounts.ResetPasswordAsync(request, cancellationToken);
        return NoContent();
    }
}
