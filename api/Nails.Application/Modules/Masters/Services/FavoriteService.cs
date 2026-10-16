using Microsoft.Extensions.Options;
using Nails.Application.Common.Paging;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Options;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Masters.Services;

public sealed class FavoriteService(
    IFavoriteRepository favorites,
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser,
    IOptions<FavoritesOptions> options,
    TimeProvider clock) : IFavoriteService
{
    public async Task<PagedResponse<FavoriteMasterResponse>> ListAsync(FavoritesRequest request, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var pageSize = Math.Min(request.PageSize ?? settings.DefaultPageSize, settings.MaxPageSize);
        var page = await favorites.PageAsync(currentUser.UserId, request.Page, pageSize, cancellationToken);

        return new PagedResponse<FavoriteMasterResponse>(
            [.. page.Items.Select(row => new FavoriteMasterResponse(
                row.Id,
                row.Name,
                row.PhotoUrl,
                row.Specialty,
                MasterFacts.Rating(row.RatingAverage),
                row.ReviewsCount,
                row.Verified))],
            request.Page,
            pageSize,
            page.TotalCount);
    }

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
            throw MastersErrors.MasterNotFound();
        }
    }
}
