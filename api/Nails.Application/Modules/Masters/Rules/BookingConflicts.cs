namespace Nails.Application.Modules.Masters.Rules;

public sealed record BookingConflicts(IReadOnlyList<Guid> Overlapping, IReadOnlyList<Guid> TooClose);
