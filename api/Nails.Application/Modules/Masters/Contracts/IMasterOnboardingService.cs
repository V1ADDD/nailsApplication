using Nails.Application.Modules.Identity.Responses;
using Nails.Application.Modules.Masters.Requests;

namespace Nails.Application.Modules.Masters.Contracts;

public interface IMasterOnboardingService
{
    IReadOnlyList<string> Cities();

    Task<MeResponse> CreateAsync(BecomeMasterRequest request, CancellationToken cancellationToken);
}
