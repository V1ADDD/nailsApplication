using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Application.Modules.Masters.Contracts;

public interface IBookingService
{
    Task<ConflictsResponse> ConflictsAsync(ConflictsRequest request, CancellationToken cancellationToken);

    Task<CreateBookingResponse> CreateAsync(CreateBookingRequest request, CancellationToken cancellationToken);

    Task<BookingResponse> ConfirmAsync(Guid bookingId, CancellationToken cancellationToken);

    Task<BookingResponse> CancelAsync(Guid bookingId, CancelBookingRequest request, CancellationToken cancellationToken);
}
