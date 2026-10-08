using Microsoft.AspNetCore.Mvc;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Api.Modules.Masters.Controllers;

[ApiController]
[Route("me/offers")]
public sealed class MyOffersController(IMyMasterService master) : ControllerBase
{
    [HttpPost]
    public Task<OfferResponse> Add(OfferRequest request, CancellationToken cancellationToken) =>
        master.AddOfferAsync(request, cancellationToken);

    [HttpPut("{id:guid}")]
    public Task<OfferResponse> Update(Guid id, OfferRequest request, CancellationToken cancellationToken) =>
        master.UpdateOfferAsync(id, request, cancellationToken);

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await master.DeleteOfferAsync(id, cancellationToken);
        return NoContent();
    }
}
