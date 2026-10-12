using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nails.Application.Common.Paging;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Api.Modules.Masters.Controllers;

[ApiController]
[Route("")]
public sealed class MastersController(IMasterSearchService search, IMasterProfileService profiles) : ControllerBase
{
    [HttpGet("search")]
    [AllowAnonymous]
    public Task<MasterSearchResponse> Search([FromQuery] MasterSearchRequest request, CancellationToken cancellationToken) =>
        search.SearchAsync(request, cancellationToken);

    [HttpGet("{id:guid}/card")]
    [AllowAnonymous]
    public Task<MasterCardResponse> Card(Guid id, [FromQuery] CardRequest request, CancellationToken cancellationToken) =>
        search.CardAsync(id, request, cancellationToken);

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public Task<MasterProfileResponse> Profile(Guid id, [FromQuery] CardRequest request, CancellationToken cancellationToken) =>
        profiles.ProfileAsync(id, request, cancellationToken);

    [HttpGet("{id:guid}/slots")]
    [AllowAnonymous]
    public Task<SlotsResponse> Slots(Guid id, CancellationToken cancellationToken) => profiles.SlotsAsync(id, cancellationToken);

    [HttpGet("{id:guid}/reviews")]
    [AllowAnonymous]
    public Task<PagedResponse<ReviewResponse>> Reviews(Guid id, [FromQuery] ReviewsRequest request, CancellationToken cancellationToken) =>
        profiles.ReviewsAsync(id, request, cancellationToken);
}
