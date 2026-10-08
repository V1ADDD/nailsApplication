using System.Net;
using Nails.Infrastructure.Email.Models;
using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Application.Modules.Identity.Services;

public static class IdentityEmails
{
    public const string ConfirmEmailPath = "confirm-email";
    public const string ResetPasswordPath = "reset-password";

    private const string ProductName = "«Мастера рядом»";

    public static EmailMessage Confirmation(string clientUrl, ApplicationUser user, string token) =>
        Message(
            user,
            "Подтвердите адрес электронной почты",
            $"Подтвердите адрес электронной почты, чтобы закончить регистрацию в сервисе {ProductName}.",
            "Подтвердить адрес",
            Link(clientUrl, ConfirmEmailPath, user, token));

    public static EmailMessage PasswordReset(string clientUrl, ApplicationUser user, string token) =>
        Message(
            user,
            "Смена пароля",
            "Кто-то попросил сменить пароль вашего аккаунта. Если это были не вы, просто удалите это письмо.",
            "Задать новый пароль",
            Link(clientUrl, ResetPasswordPath, user, token));

    private static string Link(string clientUrl, string path, ApplicationUser user, string token) =>
        $"{clientUrl.TrimEnd('/')}/{path}?userId={user.Id}&code={Uri.EscapeDataString(EmailTokens.Encode(token))}";

    private static EmailMessage Message(ApplicationUser user, string subject, string intro, string action, string link)
    {
        var name = WebUtility.HtmlEncode(user.DisplayName);
        var text = $"Здравствуйте, {user.DisplayName}!\n\n{intro}\n\n{action}: {link}\n";
        var html = $"<p>Здравствуйте, {name}!</p><p>{WebUtility.HtmlEncode(intro)}</p><p><a href=\"{WebUtility.HtmlEncode(link)}\">{action}</a></p>";
        return new EmailMessage(user.Email ?? string.Empty, subject, text, html);
    }
}
