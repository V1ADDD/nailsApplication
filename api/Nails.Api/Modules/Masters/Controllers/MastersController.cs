using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nails.Application.Common.Paging;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Api.Modules.Masters.Controllers;

[ApiController]
[Route("")]
[AllowAnonymous]
public sealed class MastersController(IMasterSearchService masters) : ControllerBase
{
    [HttpGet]
    public Task<PagedResponse<MasterSummaryResponse>> List([FromQuery] SearchMastersRequest request, CancellationToken cancellationToken) =>
        masters.SearchAsync(request, cancellationToken);

    [HttpGet("{id:guid}")]
    public Task<MasterResponse> Get(Guid id, CancellationToken cancellationToken) => masters.GetAsync(id, cancellationToken);
}
