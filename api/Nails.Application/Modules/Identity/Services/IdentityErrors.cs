using System.Globalization;
using Microsoft.AspNetCore.Identity;
using Nails.Application.Common.Exceptions;

namespace Nails.Application.Modules.Identity.Services;

public static class IdentityErrors
{
    private const string PhoneField = "phone";
    private const string NameField = "name";
    private const string GeneralField = "";
    private const string PhoneInvalidTitle = "Введите номер в формате +375 XX XXX-XX-XX";
    private const string NameInvalidTitle = "Введите имя";
    private const string EmailField = "email";
    private const string TelegramField = "telegram";
    private const string ViberField = "viber";
    private const string EmailInvalidTitle = "Проверьте адрес почты";
    private const string TelegramInvalidTitle = "Проверьте имя в Telegram";
    private const string ViberInvalidTitle = "Введите белорусский номер в формате +375 XX XXX-XX-XX";

    public static InvalidRequestException PhoneInvalid() =>
        new(ErrorCodes.PhoneInvalid, PhoneInvalidTitle, Field(PhoneField, PhoneInvalidTitle));

    public static InvalidRequestException NameInvalid() =>
        new(ErrorCodes.InvalidRequest, NameInvalidTitle, Field(NameField, NameInvalidTitle));

    public static InvalidRequestException EmailInvalid() =>
        new(ErrorCodes.InvalidRequest, EmailInvalidTitle, Field(EmailField, EmailInvalidTitle));

    public static ConflictException EmailTaken() => new(ErrorCodes.EmailTaken, "Эта почта уже используется другим аккаунтом");

    public static InvalidRequestException TelegramInvalid() =>
        new(ErrorCodes.InvalidRequest, TelegramInvalidTitle, Field(TelegramField, TelegramInvalidTitle));

    public static InvalidRequestException ViberInvalid() =>
        new(ErrorCodes.InvalidRequest, ViberInvalidTitle, Field(ViberField, ViberInvalidTitle));

    public static ConflictException PhoneSame() => new(ErrorCodes.PhoneSame, "Это ваш текущий номер");

    public static ConflictException PhoneTaken() => new(ErrorCodes.PhoneTaken, "Этот номер уже привязан к другому аккаунту");

    public static InvalidRequestException CodeInvalid() => new(ErrorCodes.CodeInvalid, "Неверный код");

    public static InvalidRequestException CodeExpired() => new(ErrorCodes.CodeExpired, "Код устарел. Запросите новый.");

    public static TooManyRequestsException CodeTooSoon(int seconds) =>
        new(ErrorCodes.CodeTooSoon, string.Create(CultureInfo.InvariantCulture, $"Новый код можно запросить через {seconds} с."));

    public static InvalidRequestException From(IdentityResult result) =>
        new(
            ErrorCodes.InvalidRequest,
            InvalidRequestException.DefaultTitle,
            new Dictionary<string, string[]>
            {
                [GeneralField] = [.. result.Errors.Select(error => error.Description).Distinct(StringComparer.Ordinal)]
            });

    private static Dictionary<string, string[]> Field(string field, string message) => new() { [field] = [message] };
}
