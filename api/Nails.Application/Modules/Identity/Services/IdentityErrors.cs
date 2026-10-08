using Microsoft.AspNetCore.Identity;
using Nails.Application.Common.Exceptions;

namespace Nails.Application.Modules.Identity.Services;

public static class IdentityErrors
{
    private const string EmailField = "email";
    private const string PasswordField = "password";
    private const string GeneralField = "";
    private const string PasswordPrefix = "Password";
    private const string EmailCode = "Email";
    private const string UserNameCode = "UserName";

    public static InvalidRequestException LinkInvalid() =>
        new(ErrorCodes.LinkInvalid, "Ссылка недействительна или устарела.");

    public static UnauthorizedException CredentialsRejected() =>
        new(ErrorCodes.CredentialsRejected, "Неверный адрес электронной почты или пароль.");

    public static InvalidRequestException From(IdentityResult result)
    {
        var errors = result.Errors
            .GroupBy(error => FieldOf(error.Code))
            .ToDictionary(group => group.Key, group => group.Select(error => error.Description).Distinct(StringComparer.Ordinal).ToArray());

        return new InvalidRequestException(ErrorCodes.InvalidRequest, InvalidRequestException.DefaultTitle, errors);
    }

    private static string FieldOf(string code) =>
        code.StartsWith(PasswordPrefix, StringComparison.Ordinal) ? PasswordField
        : code.Contains(EmailCode, StringComparison.Ordinal) || code.Contains(UserNameCode, StringComparison.Ordinal) ? EmailField
        : GeneralField;
}
