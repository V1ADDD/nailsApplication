using Microsoft.AspNetCore.Identity;
using Nails.Application.Common.Exceptions;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Identity.Requests;
using Nails.Application.Modules.Identity.Responses;
using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Application.Modules.Identity.Services;

public sealed class SessionService(
    UserManager<ApplicationUser> users,
    SignInManager<ApplicationUser> signIn,
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
            { IsLockedOut: true } => new TooManyRequestsException(ErrorCodes.LockedOut, "Слишком много неудачных попыток. Попробуйте позже."),
            { IsNotAllowed: true } => new ForbiddenException(ErrorCodes.EmailNotConfirmed, "Подтвердите адрес электронной почты, прежде чем войти."),
            _ => IdentityErrors.CredentialsRejected()
        };
    }

    public Task SignOutAsync() => signIn.SignOutAsync();

    public async Task<MeResponse> MeAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = await users.FindByIdAsync(currentUser.UserId.ToString())
            ?? throw new UnauthorizedException(ErrorCodes.SessionEnded, "Сеанс завершён. Войдите снова.");

        return new MeResponse(user.Id, user.Email ?? string.Empty, user.DisplayName);
    }
}
