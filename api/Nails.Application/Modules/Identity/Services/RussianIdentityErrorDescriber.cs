using Microsoft.AspNetCore.Identity;

namespace Nails.Application.Modules.Identity.Services;

public sealed class RussianIdentityErrorDescriber : IdentityErrorDescriber
{
    private const string PhoneTaken = "Этот номер телефона уже зарегистрирован.";
    private const string PhoneInvalid = "Введите номер в формате +375 XX XXX-XX-XX";

    public override IdentityError DefaultError() => Russian(base.DefaultError(), "Что-то пошло не так. Попробуйте ещё раз.");

    public override IdentityError ConcurrencyFailure() =>
        Russian(base.ConcurrencyFailure(), "Данные изменились. Обновите страницу и попробуйте снова.");

    public override IdentityError InvalidUserName(string? userName) => Russian(base.InvalidUserName(userName), PhoneInvalid);

    public override IdentityError DuplicateUserName(string userName) => Russian(base.DuplicateUserName(userName), PhoneTaken);

    private static IdentityError Russian(IdentityError error, string description) =>
        new() { Code = error.Code, Description = description };
}
