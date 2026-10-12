namespace Nails.Application.Modules.Masters.Responses;

public sealed record ConflictsResponse(IReadOnlyList<BookingSummaryResponse> Overlapping, IReadOnlyList<BookingSummaryResponse> TooClose);
