using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Starter.Application.Common.Exceptions;
using Starter.Application.Common.Options;
using Starter.Application.Common.Tenancy;
using Starter.Application.Modules.Identity.Contracts;
using Starter.Application.Modules.Identity.Options;
using Starter.Application.Modules.Identity.Requests;
using Starter.Application.Modules.Identity.Responses;
using Starter.Infrastructure.Email.Contracts;
using Starter.Infrastructure.Modules.Identity.Contracts;
using Starter.Infrastructure.Modules.Identity.Entities;
using Starter.Infrastructure.Persistence.Contracts;

namespace Starter.Application.Modules.Identity.Services;

public sealed class AccountService(
    UserManager<ApplicationUser> users,
    UserFactory userFactory,
    ITenantRepository tenants,
    IUnitOfWork unitOfWork,
    TenantContext tenantContext,
    IEmailSender email,
    IOptions<RegistrationOptions> registration,
    IOptions<IdentityOptions> identity,
    IOptions<AppOptions> app) : IAccountService
{
    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        if (!registration.Value.Enabled)
        {
            throw new ForbiddenException(ErrorCodes.RegistrationClosed, "Registration is closed.");
        }

        var tenant = new Tenant { Id = Guid.CreateVersion7(), Name = request.OrganizationName.Trim() };
        ApplicationUser? owner = null;

        await unitOfWork.InTransactionAsync(async token =>
        {
            tenants.Add(tenant);
            await unitOfWork.SaveChangesAsync(token);
            tenantContext.Set(tenant.Id);
            owner = await userFactory.CreateOwnerAsync(tenant, request.Email, request.DisplayName, request.Password, emailConfirmed: false);
        }, cancellationToken);

        if (!identity.Value.SignIn.RequireConfirmedEmail || owner is null)
        {
            return new RegisterResponse(RequiresEmailConfirmation: false);
        }

        await SendConfirmationAsync(owner, cancellationToken);
        return new RegisterResponse(RequiresEmailConfirmation: true);
    }

    public async Task ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = await users.FindByIdAsync(request.UserId.ToString());

        if (user is null || !EmailTokens.TryDecode(request.Code, out var token) || !(await users.ConfirmEmailAsync(user, token)).Succeeded)
        {
            throw IdentityErrors.LinkInvalid();
        }
    }

    public async Task ResendConfirmationAsync(EmailRequest request, CancellationToken cancellationToken)
    {
        var user = await users.FindByEmailAsync(request.Email.Trim());

        if (user is { EmailConfirmed: false })
        {
            await SendConfirmationAsync(user, cancellationToken);
        }
    }

    public async Task ForgotPasswordAsync(EmailRequest request, CancellationToken cancellationToken)
    {
        var user = await users.FindByEmailAsync(request.Email.Trim());

        if (user is { EmailConfirmed: true })
        {
            var token = await users.GeneratePasswordResetTokenAsync(user);
            await email.SendAsync(IdentityEmails.PasswordReset(app.Value.ClientUrl, user, token), cancellationToken);
        }
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = await users.FindByIdAsync(request.UserId.ToString());

        if (user is null || !EmailTokens.TryDecode(request.Code, out var token))
        {
            throw IdentityErrors.LinkInvalid();
        }

        var result = await users.ResetPasswordAsync(user, token, request.NewPassword);

        if (result.Succeeded)
        {
            await users.UpdateSecurityStampAsync(user);
            return;
        }

        throw result.Errors.Any(error => error.Code == nameof(IdentityErrorDescriber.InvalidToken))
            ? IdentityErrors.LinkInvalid()
            : IdentityErrors.From(result);
    }

    private async Task SendConfirmationAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var token = await users.GenerateEmailConfirmationTokenAsync(user);
        await email.SendAsync(IdentityEmails.Confirmation(app.Value.ClientUrl, user, token), cancellationToken);
    }
}
