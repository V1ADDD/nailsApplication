using System.Globalization;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Nails.Application.Common.Exceptions;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Identity.Options;
using Nails.Application.Modules.Identity.Requests;
using Nails.Application.Modules.Identity.Responses;
using Nails.Application.Modules.Identity.Rules;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Identity.Services;

public sealed partial class SessionService(
    UserManager<ApplicationUser> users,
    SignInManager<ApplicationUser> signIn,
    ICurrentUser currentUser,
    IPhoneCodeRepository codes,
    IUnitOfWork unitOfWork,
    ISmsSender sms,
    UserFactory userFactory,
    TimeProvider clock,
    IOptions<PhoneCodeOptions> options,
    ILogger<SessionService> logger) : ISessionService
{
    private const int DecimalBase = 10;

    private static readonly PasswordHasher<PhoneCode> Hasher = new();

    public async Task<PhoneCodeResponse> RequestCodeAsync(PhoneCodeRequest request, CancellationToken cancellationToken)
    {
        var phone = BelarusPhone.Normalize(request.Phone) ?? throw IdentityErrors.PhoneInvalid();
        var settings = options.Value;
        var now = clock.GetUtcNow();

        if (!settings.VerificationRequired)
        {
            LogVerificationOff(logger);
            return new PhoneCodeResponse(CodeRequired: false, settings.Length, ResendAfterSeconds: 0);
        }

        var entry = await codes.FindAsync(phone, cancellationToken);

        if (entry is null)
        {
            entry = new PhoneCode { Id = Guid.CreateVersion7(), Phone = phone };
            codes.Add(entry);
        }
        else
        {
            var wait = PhoneCodeState.ResendWait(entry.SentAt, settings.ResendInterval, now);

            if (wait > TimeSpan.Zero)
            {
                throw IdentityErrors.CodeTooSoon(WholeSeconds(wait));
            }
        }

        var code = Generate(settings.Length);
        entry.CodeHash = Hasher.HashPassword(entry, code);
        entry.SentAt = now;
        entry.ExpiresAt = now + settings.Lifetime;
        entry.Attempts = 0;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await sms.SendAsync(phone, $"Код для входа в «Мастера рядом»: {code}. Никому его не сообщайте.", cancellationToken);

        return new PhoneCodeResponse(CodeRequired: true, settings.Length, WholeSeconds(settings.ResendInterval));
    }

    public async Task<SignInResponse> SignInAsync(SignInRequest request, CancellationToken cancellationToken)
    {
        var phone = BelarusPhone.Normalize(request.Phone) ?? throw IdentityErrors.PhoneInvalid();
        var entry = await VerifyCodeAsync(phone, request.Code, cancellationToken);

        var user = await users.FindByNameAsync(phone);

        if (user is null)
        {
            if (request.Name is null)
            {
                return new SignInResponse(NameRequired: true);
            }

            var name = request.Name.Trim();

            if (name.Length is 0 or > SignInRequest.NameMaxLength)
            {
                throw IdentityErrors.NameInvalid();
            }

            user = await userFactory.CreateAsync(name, phone, cancellationToken);
        }

        if (entry is not null)
        {
            codes.Remove(entry);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        await signIn.SignInAsync(user, isPersistent: true);

        return new SignInResponse(NameRequired: false);
    }

    public Task SignOutAsync() => signIn.SignOutAsync();

    public async Task<MeResponse> MeAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = await users.FindByIdAsync(currentUser.UserId.ToString())
            ?? throw new UnauthorizedException(ErrorCodes.SessionEnded, "Сеанс завершён. Войдите снова.");

        return new MeResponse(user.Id, user.DisplayName, user.PhoneNumber);
    }

    private async Task<PhoneCode?> VerifyCodeAsync(string phone, string? code, CancellationToken cancellationToken)
    {
        var settings = options.Value;

        if (!settings.VerificationRequired)
        {
            return null;
        }

        var entry = await codes.FindAsync(phone, cancellationToken);

        if (entry is null || !PhoneCodeState.IsUsable(entry.ExpiresAt, entry.Attempts, settings.MaxAttempts, clock.GetUtcNow()))
        {
            throw IdentityErrors.CodeExpired();
        }

        if (code is null || Hasher.VerifyHashedPassword(entry, entry.CodeHash, code.Trim()) == PasswordVerificationResult.Failed)
        {
            entry.Attempts++;
            await unitOfWork.SaveChangesAsync(cancellationToken);
            throw entry.Attempts >= settings.MaxAttempts ? IdentityErrors.CodeExpired() : IdentityErrors.CodeInvalid();
        }

        return entry;
    }

    private static string Generate(int length)
    {
        var upper = (int)Math.Pow(DecimalBase, length);
        return RandomNumberGenerator.GetInt32(upper).ToString(new string('0', length), CultureInfo.InvariantCulture);
    }

    private static int WholeSeconds(TimeSpan duration) => (int)Math.Ceiling(duration.TotalSeconds);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Phone verification is switched off: signing in without an SMS code.")]
    private static partial void LogVerificationOff(ILogger logger);
}
