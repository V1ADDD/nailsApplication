namespace Nails.Application.Modules.Masters.Responses;

public sealed record SlotsResponse(int Days, IReadOnlyList<SlotEntryResponse> Items);
