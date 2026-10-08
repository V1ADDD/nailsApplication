using System.Net;
using Starter.Infrastructure.Email.Models;
using Starter.Infrastructure.Modules.Identity.Entities;

namespace Starter.Application.Modules.Identity.Services;

public static class IdentityEmails
{
    public const string ConfirmEmailPath = "confirm-email";
    public const string ResetPasswordPath = "reset-password";

    private const string ProductName = "Starter";

    public static EmailMessage Confirmation(string clientUrl, ApplicationUser user, string token) =>
        Message(
            user,
            $"Confirm your {ProductName} account",
            $"Confirm your email address to finish setting up your {ProductName} account.",
            "Confirm email",
            Link(clientUrl, ConfirmEmailPath, user, token));

    public static EmailMessage PasswordReset(string clientUrl, ApplicationUser user, string token) =>
        Message(
            user,
            $"Reset your {ProductName} password",
            "Someone asked to reset the password of your account. If it was not you, ignore this email.",
            "Choose a new password",
            Link(clientUrl, ResetPasswordPath, user, token));

    private static string Link(string clientUrl, string path, ApplicationUser user, string token) =>
        $"{clientUrl.TrimEnd('/')}/{path}?userId={user.Id}&code={Uri.EscapeDataString(EmailTokens.Encode(token))}";

    private static EmailMessage Message(ApplicationUser user, string subject, string intro, string action, string link)
    {
        var name = WebUtility.HtmlEncode(user.DisplayName);
        var text = $"Hello {user.DisplayName},\n\n{intro}\n\n{action}: {link}\n";
        var html = $"<p>Hello {name},</p><p>{WebUtility.HtmlEncode(intro)}</p><p><a href=\"{WebUtility.HtmlEncode(link)}\">{action}</a></p>";
        return new EmailMessage(user.Email ?? string.Empty, subject, text, html);
    }
}
