using Microsoft.AspNetCore.Identity;

namespace Nails.Application.Modules.Identity.Services;

public sealed class RussianIdentityErrorDescriber : IdentityErrorDescriber
{
    private const string EmailTaken = "Этот адрес электронной почты уже зарегистрирован.";
    private const string EmailInvalid = "Укажите адрес электронной почты.";

    public override IdentityError DefaultError() => Russian(base.DefaultError(), "Что-то пошло не так. Попробуйте ещё раз.");

    public override IdentityError ConcurrencyFailure() =>
        Russian(base.ConcurrencyFailure(), "Данные изменились. Обновите страницу и попробуйте снова.");

    public override IdentityError PasswordMismatch() => Russian(base.PasswordMismatch(), "Неверный пароль.");

    public override IdentityError InvalidToken() => Russian(base.InvalidToken(), "Ссылка недействительна или устарела.");

    public override IdentityError RecoveryCodeRedemptionFailed() =>
        Russian(base.RecoveryCodeRedemptionFailed(), "Код восстановления не подошёл.");

    public override IdentityError LoginAlreadyAssociated() =>
        Russian(base.LoginAlreadyAssociated(), "Этот вход уже привязан к другому аккаунту.");

    public override IdentityError InvalidUserName(string? userName) => Russian(base.InvalidUserName(userName), EmailInvalid);

    public override IdentityError InvalidEmail(string? email) => Russian(base.InvalidEmail(email), EmailInvalid);

    public override IdentityError DuplicateUserName(string userName) => Russian(base.DuplicateUserName(userName), EmailTaken);

    public override IdentityError DuplicateEmail(string email) => Russian(base.DuplicateEmail(email), EmailTaken);

    public override IdentityError InvalidRoleName(string? role) => Russian(base.InvalidRoleName(role), "Недопустимое название роли.");

    public override IdentityError DuplicateRoleName(string role) => Russian(base.DuplicateRoleName(role), "Такая роль уже есть.");

    public override IdentityError UserAlreadyHasPassword() => Russian(base.UserAlreadyHasPassword(), "Пароль уже задан.");

    public override IdentityError UserLockoutNotEnabled() =>
        Russian(base.UserLockoutNotEnabled(), "Блокировка для этого аккаунта не включена.");

    public override IdentityError UserAlreadyInRole(string role) => Russian(base.UserAlreadyInRole(role), "У аккаунта уже есть эта роль.");

    public override IdentityError UserNotInRole(string role) => Russian(base.UserNotInRole(role), "У аккаунта нет этой роли.");

    public override IdentityError PasswordTooShort(int length) =>
        Russian(base.PasswordTooShort(length), $"Пароль должен быть не короче {length} символов.");

    public override IdentityError PasswordRequiresUniqueChars(int uniqueChars) =>
        Russian(base.PasswordRequiresUniqueChars(uniqueChars), $"В пароле должно быть не меньше {uniqueChars} разных символов.");

    public override IdentityError PasswordRequiresNonAlphanumeric() =>
        Russian(base.PasswordRequiresNonAlphanumeric(), "В пароле должен быть хотя бы один знак, не буква и не цифра.");

    public override IdentityError PasswordRequiresDigit() => Russian(base.PasswordRequiresDigit(), "В пароле должна быть хотя бы одна цифра.");

    public override IdentityError PasswordRequiresLower() =>
        Russian(base.PasswordRequiresLower(), "В пароле должна быть хотя бы одна строчная буква.");

    public override IdentityError PasswordRequiresUpper() =>
        Russian(base.PasswordRequiresUpper(), "В пароле должна быть хотя бы одна заглавная буква.");

    private static IdentityError Russian(IdentityError error, string description) =>
        new() { Code = error.Code, Description = description };
}
