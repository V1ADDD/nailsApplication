using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Nails.Application.Common.Exceptions;
using Nails.Application.Common.Media;
using Nails.Application.Common.Realtime;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Identity.Options;
using Nails.Application.Modules.Identity.Requests;
using Nails.Application.Modules.Identity.Responses;
using Nails.Application.Modules.Identity.Rules;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Identity.Services;

public sealed partial class AccountService(
    UserManager<ApplicationUser> users,
    SignInManager<ApplicationUser> signIn,
    ICurrentUser currentUser,
    IPhoneChangeCodeRepository codes,
    IUnitOfWork unitOfWork,
    ISmsSender sms,
    IMediaOwnership media,
    IRealtimeConnections connections,
    TimeProvider clock,
    IOptions<PhoneCodeOptions> options,
    IOptions<PresenceOptions> presence,
    ILogger<AccountService> logger) : IAccountService
{
    private static readonly EmailAddressAttribute EmailFormat = new();

    public async Task<MeResponse> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var user = await CurrentAsync();

        if (request.Name is { } rawName)
        {
            var name = rawName.Trim();
            user.DisplayName = name.Length is 0 or > SignInRequest.NameMaxLength ? throw IdentityErrors.NameInvalid() : name;
        }

        if (request.Email is { } rawEmail)
        {
            user.Email = await EmailAsync(rawEmail.Trim(), user.Id);
        }

        if (request.PhotoUrl is { } photoUrl)
        {
            user.PhotoUrl = await PhotoAsync(photoUrl.Trim(), user.Id, cancellationToken);
        }

        if (request.Telegram is { } telegram)
        {
            user.Telegram = Blank(telegram) ? null : TelegramName.Normalize(telegram) ?? throw IdentityErrors.TelegramInvalid();
        }

        if (request.Viber is { } viber)
        {
            user.Viber = Blank(viber) ? null : BelarusPhone.Normalize(viber) ?? throw IdentityErrors.ViberInvalid();
        }

        if (request.PreferredContact is { } contact)
        {
            user.PreferredContact = contact;
        }

        await SaveAsync(user, IdentityErrors.EmailTaken);
        return Me(user);
    }

    public async Task<NotificationSettingsResponse> SetNotificationsAsync(
        NotificationSettingsRequest request,
        CancellationToken cancellationToken)
    {
        var user = await CurrentAsync();
        user.NotifyPush = request.Push;
        user.NotifyEmail = request.Email;
        user.NotifySite = request.Site;
        user.NotifyReminders = request.Reminders;
        await SaveAsync(user, IdentityErrors.EmailTaken);

        return MeResponses.Notifications(user);
    }

    public async Task<PhoneCodeResponse> RequestPhoneCodeAsync(PhoneChangeCodeRequest request, CancellationToken cancellationToken)
    {
        var user = await CurrentAsync();
        var phone = await NewPhoneAsync(request.Phone, user);
        var settings = options.Value;
        var now = clock.GetUtcNow();

        if (!settings.VerificationRequired)
        {
            LogVerificationOff(logger);
            return new PhoneCodeResponse(CodeRequired: false, settings.Length, ResendAfterSeconds: 0);
        }

        var entry = await codes.FindAsync(user.Id, cancellationToken);

        if (entry is null)
        {
            entry = new PhoneChangeCode { Id = Guid.CreateVersion7(), UserId = user.Id };
            codes.Add(entry);
        }
        else
        {
            var wait = PhoneCodeState.ResendWait(entry.SentAt, settings.ResendInterval, now);

            if (wait > TimeSpan.Zero)
            {
                throw IdentityErrors.CodeTooSoon(PhoneCodes.WholeSeconds(wait));
            }
        }

        var code = PhoneCodes.Generate(settings.Length);
        entry.Phone = phone;
        entry.CodeHash = PhoneCodes.Hash(code);
        entry.SentAt = now;
        entry.ExpiresAt = now + settings.Lifetime;
        entry.Attempts = 0;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await sms.SendAsync(phone, $"Код для смены номера в «Мастера рядом»: {code}. Никому его не сообщайте.", cancellationToken);

        return new PhoneCodeResponse(CodeRequired: true, settings.Length, PhoneCodes.WholeSeconds(settings.ResendInterval));
    }

    public async Task<MeResponse> ChangePhoneAsync(PhoneChangeRequest request, CancellationToken cancellationToken)
    {
        var user = await CurrentAsync();
        var phone = await NewPhoneAsync(request.Phone, user);
        var settings = options.Value;
        PhoneChangeCode? entry = null;

        if (settings.VerificationRequired)
        {
            entry = await codes.FindAsync(user.Id, cancellationToken);

            if (entry is null || entry.Phone != phone || !PhoneCodeState.IsUsable(entry.ExpiresAt, entry.Attempts, settings.MaxAttempts, clock.GetUtcNow()))
            {
                throw IdentityErrors.CodeExpired();
            }

            if (!PhoneCodes.Matches(entry.CodeHash, request.Code))
            {
                entry.Attempts++;
                await unitOfWork.SaveChangesAsync(cancellationToken);
                throw entry.Attempts >= settings.MaxAttempts ? IdentityErrors.CodeExpired() : IdentityErrors.CodeInvalid();
            }
        }

        user.UserName = phone;
        user.PhoneNumber = phone;
        await SaveAsync(user, IdentityErrors.PhoneTaken);

        if (entry is not null)
        {
            codes.Remove(entry);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return Me(user);
    }

    public async Task SignOutOthersAsync(CancellationToken cancellationToken)
    {
        var user = await CurrentAsync();
        Check(await users.UpdateSecurityStampAsync(user), IdentityErrors.PhoneTaken);
        await signIn.RefreshSignInAsync(user);
        await connections.AbortAsync(user.Id, cancellationToken);
    }

    private async Task<string?> EmailAsync(string email, Guid userId)
    {
        if (email.Length == 0)
        {
            return null;
        }

        if (!EmailFormat.IsValid(email))
        {
            throw IdentityErrors.EmailInvalid();
        }

        return await users.FindByEmailAsync(email) is { } other && other.Id != userId ? throw IdentityErrors.EmailTaken() : email;
    }

    private async Task<string?> PhotoAsync(string photoUrl, Guid userId, CancellationToken cancellationToken)
    {
        if (photoUrl.Length == 0)
        {
            return null;
        }

        return await media.IsOwnedByAsync(photoUrl, userId, cancellationToken) ? photoUrl : throw MediaErrors.NotOwned();
    }

    private async Task<string> NewPhoneAsync(string rawPhone, ApplicationUser user)
    {
        var phone = BelarusPhone.Normalize(rawPhone) ?? throw IdentityErrors.PhoneInvalid();

        if (phone == user.PhoneNumber)
        {
            throw IdentityErrors.PhoneSame();
        }

        return await users.FindByNameAsync(phone) is null ? phone : throw IdentityErrors.PhoneTaken();
    }

    private async Task SaveAsync(ApplicationUser user, Func<ConflictException> onDuplicate)
    {
        try
        {
            Check(await users.UpdateAsync(user), onDuplicate);
        }
        catch (DbUpdateException exception) when (DatabaseErrors.IsUniqueViolation(exception))
        {
            throw onDuplicate();
        }
    }

    private static void Check(IdentityResult result, Func<ConflictException> onDuplicate)
    {
        if (result.Succeeded)
        {
            return;
        }

        throw result.Errors.Any(error => error.Code is nameof(IdentityErrorDescriber.DuplicateUserName) or nameof(IdentityErrorDescriber.DuplicateEmail))
            ? onDuplicate()
            : IdentityErrors.From(result);
    }

    private async Task<ApplicationUser> CurrentAsync() =>
        await users.FindByIdAsync(currentUser.UserId.ToString())
            ?? throw new UnauthorizedException(ErrorCodes.SessionEnded, "Сеанс завершён. Войдите снова.");

    private MeResponse Me(ApplicationUser user) => MeResponses.From(user, presence.Value.TouchInterval);

    private static bool Blank(string value) => string.IsNullOrWhiteSpace(value);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Phone verification is switched off: changing the phone without an SMS code.")]
    private static partial void LogVerificationOff(ILogger logger);
}
