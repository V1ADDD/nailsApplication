namespace Nails.Infrastructure.Modules.Identity.Contracts;

public interface ISmsSender
{
    Task SendAsync(string phone, string text, CancellationToken cancellationToken);
}
