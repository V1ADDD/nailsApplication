using Nails.Application.Modules.Masters.Responses;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public static class Slots
{
    public static IReadOnlyList<SlotView> OnePerStart(IEnumerable<SlotView> slots) =>
        [.. slots
            .GroupBy(slot => slot.StartAt)
            .Select(group => group.FirstOrDefault(slot => slot.Status == SlotStatus.Free) ?? group.First())
            .OrderBy(slot => slot.StartAt)];

    public static SlotEntryStatus StatusFor(SlotStatus status) => status switch
    {
        SlotStatus.Free => SlotEntryStatus.Free,
        SlotStatus.Pending => SlotEntryStatus.Pending,
        _ => SlotEntryStatus.Busy
    };
}
