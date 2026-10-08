using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Application.Modules.Masters.Contracts;

public interface IMasterSearchService
{
    Task<MasterSearchResponse> SearchAsync(MasterSearchRequest request, CancellationToken cancellationToken);

    Task<MasterCardResponse> CardAsync(Guid masterId, CardRequest request, CancellationToken cancellationToken);
}
