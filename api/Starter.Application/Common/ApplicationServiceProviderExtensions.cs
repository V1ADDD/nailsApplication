using Microsoft.Extensions.DependencyInjection;
using Starter.Application.Modules.Identity.Contracts;
using Starter.Infrastructure.Common;
using Starter.Infrastructure.Persistence;

namespace Starter.Application.Common;

public static class ApplicationServiceProviderExtensions
{
    public static async Task PrepareApplicationAsync(this IServiceProvider services, CancellationToken cancellationToken)
    {
        if (BuildContext.IsGeneratingOpenApiDocument)
        {
            return;
        }

        await services.MigrateDatabaseAsync(cancellationToken);

        await using var scope = services.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<IIdentityBootstrapper>().RunAsync(cancellationToken);
    }
}
