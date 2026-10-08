namespace Nails.Infrastructure.Persistence.Contracts;

public interface IUnitOfWork
{
    Task SaveChangesAsync(CancellationToken cancellationToken);

    Task InTransactionAsync(Func<CancellationToken, Task> work, CancellationToken cancellationToken);
}
