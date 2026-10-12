namespace Nails.Application.Modules.Masters.Responses;

public sealed record BookingSummaryResponse(Guid Id, string MasterName, string ServiceName, DateTimeOffset Start, int DurationMin, string Address);
