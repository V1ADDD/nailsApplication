using Microsoft.AspNetCore.Mvc;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Api.Modules.Masters.Controllers;

[ApiController]
[Route("bookings")]
public sealed class BookingsController(
    IBookingService bookings,
    IMyBookingService myBookings,
    IBookingMoveService moves,
    IMyReviewService reviews) : ControllerBase
{
    [HttpGet("{id:guid}")]
    public Task<MyBookingResponse> Get(Guid id, CancellationToken cancellationToken) =>
        myBookings.FindAsync(id, cancellationToken);

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

    [HttpPost("{id:guid}/reviews")]
    [ProducesResponseType<ReviewResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> WriteReview(Guid id, WriteReviewRequest request, CancellationToken cancellationToken) =>
        StatusCode(StatusCodes.Status201Created, await reviews.WriteAsync(id, request, cancellationToken));

    [HttpPost("{id:guid}/move")]
    public Task<MyBookingResponse> RequestMove(Guid id, MoveBookingRequest request, CancellationToken cancellationToken) =>
        moves.RequestAsync(id, request, cancellationToken);

    [HttpDelete("{id:guid}/move")]
    public Task<MyBookingResponse> WithdrawMove(Guid id, CancellationToken cancellationToken) =>
        moves.WithdrawAsync(id, cancellationToken);

    [HttpPost("{id:guid}/move/accept")]
    public Task<BookingResponse> AcceptMove(Guid id, CancellationToken cancellationToken) =>
        moves.AcceptAsync(id, cancellationToken);

    [HttpPost("{id:guid}/move/decline")]
    public Task<BookingResponse> DeclineMove(Guid id, CancellationToken cancellationToken) =>
        moves.DeclineAsync(id, cancellationToken);
}
