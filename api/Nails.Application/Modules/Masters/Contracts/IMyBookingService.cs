using Nails.Application.Common.Paging;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Application.Modules.Masters.Contracts;

public interface IMyBookingService
{
    Task<PagedResponse<MyBookingResponse>> MineAsync(MyBookingsRequest request, CancellationToken cancellationToken);

    Task<MyBookingResponse> FindAsync(Guid bookingId, CancellationToken cancellationToken);
}
