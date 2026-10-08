using Nails.Infrastructure.Email.Models;

namespace Nails.Infrastructure.Email.Contracts;

public interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken);
}
