using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Application.Modules.Masters.Contracts;

public interface IMyReviewService
{
    Task<ReviewResponse> WriteAsync(Guid bookingId, WriteReviewRequest request, CancellationToken cancellationToken);

    Task<MyReviewsResponse> MineAsync(MyReviewsRequest request, CancellationToken cancellationToken);
}
