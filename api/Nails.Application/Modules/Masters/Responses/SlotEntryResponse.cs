namespace Nails.Application.Modules.Masters.Responses;

public sealed record SlotEntryResponse(DateTimeOffset Start, int DurationMin, SlotEntryStatus Status, Guid? SlotId);
