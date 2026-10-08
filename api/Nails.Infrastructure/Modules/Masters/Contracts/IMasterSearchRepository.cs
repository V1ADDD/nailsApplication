using Nails.Infrastructure.Modules.Masters.Models;

namespace Nails.Infrastructure.Modules.Masters.Contracts;

public interface IMasterSearchRepository
{
    Task<IReadOnlyList<MasterCandidate>> FindCandidatesAsync(CandidateQuery query, CancellationToken cancellationToken);
}
