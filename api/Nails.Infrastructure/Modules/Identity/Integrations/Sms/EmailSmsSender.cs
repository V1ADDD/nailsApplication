using System.Net;
using Microsoft.Extensions.Options;
using Nails.Infrastructure.Email.Contracts;
using Nails.Infrastructure.Email.Models;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Options;

namespace Nails.Infrastructure.Modules.Identity.Integrations.Sms;

public sealed class EmailSmsSender(IEmailSender email, IOptions<SmsOptions> options) : ISmsSender
{
    private const string SubjectPrefix = "SMS ";

    public Task SendAsync(string phone, string text, CancellationToken cancellationToken)
    {
        var recipient = $"{phone.TrimStart('+')}@{options.Value.RecipientDomain}";
        var message = new EmailMessage(recipient, SubjectPrefix + phone, text, $"<p>{WebUtility.HtmlEncode(text)}</p>");
        return email.SendAsync(message, cancellationToken);
    }
}
