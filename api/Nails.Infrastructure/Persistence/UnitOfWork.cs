using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Persistence;

public sealed class UnitOfWork(AppDbContext dbContext) : IUnitOfWork
{
    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);

    public Task InTransactionAsync(Func<CancellationToken, Task> work, CancellationToken cancellationToken) =>
        dbContext.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
            await work(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        });
}
