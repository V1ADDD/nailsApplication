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
    }
}
