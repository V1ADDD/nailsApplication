using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Models;

namespace Nails.Application.Modules.Masters.Services;

public sealed record RankedMaster(
    MasterCandidate Candidate,
    int Score,
    IReadOnlyList<CandidateService> Services,
    bool Narrowed,
    double DistanceKm,
    bool Online,
    Price? Headline,
    double? Rating);
