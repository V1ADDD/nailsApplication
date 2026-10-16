using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Application.Modules.Masters.Contracts;

public interface IBookingMoveService
{
    Task<MyBookingResponse> RequestAsync(Guid bookingId, MoveBookingRequest request, CancellationToken cancellationToken);

    Task<MyBookingResponse> WithdrawAsync(Guid bookingId, CancellationToken cancellationToken);

    Task<BookingResponse> AcceptAsync(Guid bookingId, CancellationToken cancellationToken);

    Task<BookingResponse> DeclineAsync(Guid bookingId, CancellationToken cancellationToken);
}
