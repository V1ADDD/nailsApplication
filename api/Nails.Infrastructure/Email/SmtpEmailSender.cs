using MailKit.Net.Smtp;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using Nails.Infrastructure.Email.Contracts;
using Nails.Infrastructure.Email.Models;
using Nails.Infrastructure.Options;

namespace Nails.Infrastructure.Email;

public sealed partial class SmtpEmailSender(IOptions<EmailOptions> options, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken)
    {
        var settings = options.Value;

        using var mime = new MimeMessage();
        mime.From.Add(new MailboxAddress(settings.FromName, settings.FromAddress));
        mime.To.Add(MailboxAddress.Parse(message.To));
        mime.Subject = message.Subject;
        mime.Body = new BodyBuilder { TextBody = message.Text, HtmlBody = message.Html }.ToMessageBody();

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(settings.Host, settings.Port, settings.Security, cancellationToken);

            if (!string.IsNullOrEmpty(settings.UserName))
            {
                await client.AuthenticateAsync(settings.UserName, settings.Password, cancellationToken);
            }

            await client.SendAsync(mime, cancellationToken);
            await client.DisconnectAsync(quit: true, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            LogFailed(logger, exception, message.Subject);
        }
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Sending the email \"{Subject}\" failed")]
    private static partial void LogFailed(ILogger logger, Exception exception, string subject);
}
