using Nails.Application.Common.Paging;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Application.Modules.Masters.Contracts;

public interface IMasterSearchService
{
    Task<PagedResponse<MasterSummaryResponse>> SearchAsync(SearchMastersRequest request, CancellationToken cancellationToken);

    Task<MasterResponse> GetAsync(Guid id, CancellationToken cancellationToken);
}
