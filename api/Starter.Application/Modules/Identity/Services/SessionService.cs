using Microsoft.AspNetCore.Identity;
using Starter.Application.Common.Exceptions;
using Starter.Application.Modules.Identity.Contracts;
using Starter.Application.Modules.Identity.Requests;
using Starter.Application.Modules.Identity.Responses;
using Starter.Infrastructure.Modules.Identity.Contracts;
using Starter.Infrastructure.Modules.Identity.Entities;

namespace Starter.Application.Modules.Identity.Services;

public sealed class SessionService(
    UserManager<ApplicationUser> users,
    SignInManager<ApplicationUser> signIn,
    ITenantRepository tenants,
    ICurrentUser currentUser) : ISessionService
{
    private static readonly ApplicationUser Nobody = new();

    private static readonly Lazy<string> NobodyHash = new(() => new PasswordHasher<ApplicationUser>().HashPassword(Nobody, Guid.NewGuid().ToString()));

    public async Task SignInAsync(SignInRequest request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = await users.FindByEmailAsync(request.Email.Trim());

        if (user is null)
        {
            users.PasswordHasher.VerifyHashedPassword(Nobody, NobodyHash.Value, request.Password);
            throw IdentityErrors.CredentialsRejected();
        }

        var result = await signIn.PasswordSignInAsync(user, request.Password, request.RememberMe, lockoutOnFailure: true);

        if (result.Succeeded)
        {
            return;
        }

        throw result switch
        {
            { IsLockedOut: true } => new TooManyRequestsException(ErrorCodes.LockedOut, "Too many failed attempts. Try again later."),
            { IsNotAllowed: true } => new ForbiddenException(ErrorCodes.EmailNotConfirmed, "Confirm your email address before signing in."),
            _ => IdentityErrors.CredentialsRejected()
        };
    }

    public Task SignOutAsync() => signIn.SignOutAsync();

    public async Task<MeResponse> MeAsync(CancellationToken cancellationToken)
    {
        var user = await users.FindByIdAsync(currentUser.UserId.ToString())
            ?? throw new UnauthorizedException(ErrorCodes.SessionEnded, "Your session has ended. Sign in again.");
        var tenantName = await tenants.FindNameAsync(user.TenantId, cancellationToken) ?? string.Empty;

        return new MeResponse(user.Id, user.Email ?? string.Empty, user.DisplayName, user.Role, user.TenantId, tenantName);
    }
}
