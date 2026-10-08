using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Application.Modules.Masters.Contracts;

public interface IMyMasterService
{
    Task<MasterResponse> GetAsync(CancellationToken cancellationToken);

    Task<MasterResponse> CreateAsync(MasterProfileRequest request, CancellationToken cancellationToken);

    Task<MasterResponse> UpdateAsync(UpdateMasterProfileRequest request, CancellationToken cancellationToken);

    Task<OfferResponse> AddOfferAsync(OfferRequest request, CancellationToken cancellationToken);

    Task<OfferResponse> UpdateOfferAsync(Guid id, OfferRequest request, CancellationToken cancellationToken);

    Task DeleteOfferAsync(Guid id, CancellationToken cancellationToken);
}
