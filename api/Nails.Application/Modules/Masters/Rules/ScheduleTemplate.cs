namespace Nails.Application.Modules.Masters.Rules;

public static class ScheduleTemplate
{
    private const int MinimumSlotMinutes = 5;

    public static IReadOnlyList<TimeOnly> Times(TimeOnly from, TimeOnly to, int slotMinutes, IReadOnlyList<(TimeOnly From, TimeOnly To)> breaks)
    {
        var length = Math.Max(MinimumSlotMinutes, slotMinutes);
        var end = Minutes(to);
        var pauses = breaks
            .Select(pause => (From: Minutes(pause.From), To: Minutes(pause.To)))
            .Where(pause => pause.To > pause.From)
            .ToList();
        var times = new List<TimeOnly>();
        var cursor = Minutes(from);

        while (cursor + length <= end)
        {
            var clash = pauses.FirstOrDefault(pause => cursor < pause.To && pause.From < cursor + length);

            if (clash != default)
            {
                cursor = clash.To;
                continue;
            }

            times.Add(TimeOnly.FromTimeSpan(TimeSpan.FromMinutes(cursor)));
            cursor += length;
        }

        return times;
    }

    private static int Minutes(TimeOnly time) => (int)time.ToTimeSpan().TotalMinutes;
}
