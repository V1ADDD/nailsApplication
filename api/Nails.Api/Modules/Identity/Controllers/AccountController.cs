using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Nails.Api.Host.Extensions;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Identity.Requests;
using Nails.Application.Modules.Identity.Responses;

namespace Nails.Api.Modules.Identity.Controllers;

[ApiController]
[Route("")]
public sealed class AccountController(IAccountService accounts) : ControllerBase
{
    [HttpPatch("me")]
    public Task<MeResponse> UpdateProfile(UpdateProfileRequest request, CancellationToken cancellationToken) =>
        accounts.UpdateProfileAsync(request, cancellationToken);

    [HttpPut("me/notifications")]
    public Task<NotificationSettingsResponse> SetNotifications(NotificationSettingsRequest request, CancellationToken cancellationToken) =>
        accounts.SetNotificationsAsync(request, cancellationToken);

    [HttpPost("me/phone/code")]
    [EnableRateLimiting(RateLimitingExtensions.IdentityPolicy)]
    public Task<PhoneCodeResponse> RequestPhoneCode(PhoneChangeCodeRequest request, CancellationToken cancellationToken) =>
        accounts.RequestPhoneCodeAsync(request, cancellationToken);

    [HttpPost("me/phone")]
    [EnableRateLimiting(RateLimitingExtensions.IdentityPolicy)]
    public Task<MeResponse> ChangePhone(PhoneChangeRequest request, CancellationToken cancellationToken) =>
        accounts.ChangePhoneAsync(request, cancellationToken);

    [HttpPost("sign-out/others")]
    public async Task<IActionResult> SignOutOthers(CancellationToken cancellationToken)
    {
        await accounts.SignOutOthersAsync(cancellationToken);
        return NoContent();
    }
}
