namespace Nails.Application.Modules.Identity.Contracts;

public interface IIdentityBootstrapper
{
    Task RunAsync(CancellationToken cancellationToken);
}
