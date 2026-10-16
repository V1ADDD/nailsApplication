using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nails.Application.Common.Paging;
using Nails.Application.Modules.Identity.Responses;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Api.Modules.Masters.Controllers;

[ApiController]
[Route("")]
public sealed class MyAccountController(
    IMyBookingService bookings,
    IMyReviewService reviews,
    IFavoriteService favorites,
    IMasterOnboardingService onboarding) : ControllerBase
{
    [HttpGet("cities")]
    [AllowAnonymous]
    public IReadOnlyList<string> Cities() => onboarding.Cities();

    [HttpPost("me")]
    [ProducesResponseType<MeResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> BecomeMaster(BecomeMasterRequest request, CancellationToken cancellationToken) =>
        StatusCode(StatusCodes.Status201Created, await onboarding.CreateAsync(request, cancellationToken));

    [HttpGet("bookings/mine")]
    public Task<PagedResponse<MyBookingResponse>> Bookings([FromQuery] MyBookingsRequest request, CancellationToken cancellationToken) =>
        bookings.MineAsync(request, cancellationToken);

    [HttpGet("reviews/mine")]
    public Task<MyReviewsResponse> Reviews([FromQuery] MyReviewsRequest request, CancellationToken cancellationToken) =>
        reviews.MineAsync(request, cancellationToken);

    [HttpGet("favorites")]
    public Task<PagedResponse<FavoriteMasterResponse>> Favorites([FromQuery] FavoritesRequest request, CancellationToken cancellationToken) =>
        favorites.ListAsync(request, cancellationToken);
}
