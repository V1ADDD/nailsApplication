using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Nails.Infrastructure.Options;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Persistence;

public static class DemoSeeding
{
    public static async Task SeedDemoAsync(this IServiceProvider services, bool requested, bool reset, CancellationToken cancellationToken)
    {
        if (!requested && !services.GetRequiredService<IOptions<DemoOptions>>().Value.Enabled)
        {
            return;
        }

        if (services.GetRequiredService<IHostEnvironment>().IsProduction())
        {
            throw new InvalidOperationException("The demo world cannot be seeded in Production.");
        }

        await using var scope = services.CreateAsyncScope();
        var seeders = scope.ServiceProvider.GetServices<IDemoSeeder>().OrderBy(seeder => seeder.Order).ToList();

        if (reset)
        {
            foreach (var seeder in Enumerable.Reverse(seeders))
            {
                await seeder.ResetAsync(cancellationToken);
            }
        }

        foreach (var seeder in seeders)
        {
            await seeder.SeedAsync(cancellationToken);
        }
    }
}
