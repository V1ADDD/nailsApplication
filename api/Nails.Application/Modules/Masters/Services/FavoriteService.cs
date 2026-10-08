using Nails.Application.Common.Exceptions;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Masters.Services;

public sealed class FavoriteService(
    IFavoriteRepository favorites,
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser,
    TimeProvider clock) : IFavoriteService
{
    public async Task AddAsync(Guid masterId, CancellationToken cancellationToken)
    {
        await EnsureMasterAsync(masterId, cancellationToken);

        if (await favorites.ExistsAsync(currentUser.UserId, masterId, cancellationToken))
        {
            return;
        }

        favorites.Add(new Favorite { UserId = currentUser.UserId, MasterId = masterId, CreatedAt = clock.GetUtcNow() });
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveAsync(Guid masterId, CancellationToken cancellationToken)
    {
        await EnsureMasterAsync(masterId, cancellationToken);
        await favorites.RemoveAsync(currentUser.UserId, masterId, cancellationToken);
    }

    public Task<IReadOnlyList<Guid>> MasterIdsAsync(CancellationToken cancellationToken) =>
        favorites.MasterIdsAsync(currentUser.UserId, cancellationToken);

    private async Task EnsureMasterAsync(Guid masterId, CancellationToken cancellationToken)
    {
        if (!await favorites.MasterExistsAsync(masterId, cancellationToken))
        {
            throw new NotFoundException("Мастер не найден");
        }
    }
}
