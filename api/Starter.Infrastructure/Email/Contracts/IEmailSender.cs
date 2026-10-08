using Starter.Infrastructure.Email.Models;

namespace Starter.Infrastructure.Email.Contracts;

public interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken);
}
