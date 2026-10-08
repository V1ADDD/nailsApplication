using Microsoft.AspNetCore.Mvc;
using Nails.Application.Modules.Masters.Contracts;

namespace Nails.Api.Modules.Masters.Controllers;

[ApiController]
[Route("")]
public sealed class FavoritesController(IFavoriteService favorites) : ControllerBase
{
    [HttpPut("{id:guid}/favorite")]
    public async Task<IActionResult> Add(Guid id, CancellationToken cancellationToken)
    {
        await favorites.AddAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}/favorite")]
    public async Task<IActionResult> Remove(Guid id, CancellationToken cancellationToken)
    {
        await favorites.RemoveAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpGet("favorites/ids")]
    public Task<IReadOnlyList<Guid>> Ids(CancellationToken cancellationToken) => favorites.MasterIdsAsync(cancellationToken);
}
