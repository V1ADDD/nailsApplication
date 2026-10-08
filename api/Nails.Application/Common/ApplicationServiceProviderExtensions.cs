using Microsoft.Extensions.DependencyInjection;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Persistence;

namespace Nails.Application.Common;

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
