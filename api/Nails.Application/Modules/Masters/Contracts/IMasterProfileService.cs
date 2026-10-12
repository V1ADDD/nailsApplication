using Nails.Application.Common.Paging;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Application.Modules.Masters.Contracts;

public interface IMasterProfileService
{
    Task<MasterProfileResponse> ProfileAsync(Guid masterId, CardRequest request, CancellationToken cancellationToken);

    Task<SlotsResponse> SlotsAsync(Guid masterId, CancellationToken cancellationToken);

    Task<PagedResponse<ReviewResponse>> ReviewsAsync(Guid masterId, ReviewsRequest request, CancellationToken cancellationToken);
}
