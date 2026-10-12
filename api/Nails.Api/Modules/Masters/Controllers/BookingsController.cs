using Microsoft.AspNetCore.Mvc;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Api.Modules.Masters.Controllers;

[ApiController]
[Route("bookings")]
public sealed class BookingsController(IBookingService bookings) : ControllerBase
{
    [HttpPost("conflicts")]
    public Task<ConflictsResponse> Conflicts(ConflictsRequest request, CancellationToken cancellationToken) =>
        bookings.ConflictsAsync(request, cancellationToken);

    [HttpPost("")]
    [ProducesResponseType<CreateBookingResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CreateBookingRequest request, CancellationToken cancellationToken) =>
        StatusCode(StatusCodes.Status201Created, await bookings.CreateAsync(request, cancellationToken));

    [HttpPost("{id:guid}/confirm")]
    public Task<BookingResponse> Confirm(Guid id, CancellationToken cancellationToken) =>
        bookings.ConfirmAsync(id, cancellationToken);

    [HttpPost("{id:guid}/cancel")]
    public Task<BookingResponse> Cancel(Guid id, CancelBookingRequest request, CancellationToken cancellationToken) =>
        bookings.CancelAsync(id, request, cancellationToken);
}
