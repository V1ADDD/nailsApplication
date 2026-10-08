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
public sealed class SessionController(ISessionService sessions) : ControllerBase
{
    [HttpPost("sign-in")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingExtensions.IdentityPolicy)]
    public async Task<IActionResult> StartSession(SignInRequest request, CancellationToken cancellationToken)
    {
        await sessions.SignInAsync(request, cancellationToken);
        return NoContent();
    }

    [HttpPost("sign-out")]
    [AllowAnonymous]
    public async Task<IActionResult> EndSession()
    {
        await sessions.SignOutAsync();
        return NoContent();
    }

    [HttpGet("me")]
    public Task<MeResponse> Me(CancellationToken cancellationToken) => sessions.MeAsync(cancellationToken);
}
