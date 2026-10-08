namespace Nails.Infrastructure.Persistence.Contracts;

public interface IDemoSeeder
{
    int Order { get; }

    Task ResetAsync(CancellationToken cancellationToken);

    Task SeedAsync(CancellationToken cancellationToken);
}
