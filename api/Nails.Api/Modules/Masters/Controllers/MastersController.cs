using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Api.Modules.Masters.Controllers;

[ApiController]
[Route("")]
public sealed class MastersController(IMasterSearchService search) : ControllerBase
{
    [HttpGet("search")]
    [AllowAnonymous]
    public Task<MasterSearchResponse> Search([FromQuery] MasterSearchRequest request, CancellationToken cancellationToken) =>
        search.SearchAsync(request, cancellationToken);

    [HttpGet("{id:guid}/card")]
    [AllowAnonymous]
    public Task<MasterCardResponse> Card(Guid id, [FromQuery] CardRequest request, CancellationToken cancellationToken) =>
        search.CardAsync(id, request, cancellationToken);
}
