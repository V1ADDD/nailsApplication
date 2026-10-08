using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Starter.Infrastructure.Options;

namespace Starter.Infrastructure.Persistence;

public static class PersistenceServiceProviderExtensions
{
    public static async Task MigrateDatabaseAsync(this IServiceProvider services, CancellationToken cancellationToken)
    {
        if (!services.GetRequiredService<IOptions<DatabaseOptions>>().Value.MigrateOnStart)
        {
            return;
        }

        await using var scope = services.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync(cancellationToken);
    }
}
