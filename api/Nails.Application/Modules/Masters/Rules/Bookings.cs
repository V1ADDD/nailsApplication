using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public static class Bookings
{
    public const int ShortLeadHours = 2;
    public const int LongLeadHours = 24;
    public const int MinGapBetweenBookingsMin = 60;

    public static DateTimeOffset PendingReleaseAt(DateTimeOffset start, DateTimeOffset createdAt)
    {
        var lead = start - createdAt;

        if (lead <= TimeSpan.FromHours(ShortLeadHours))
        {
            return start;
        }

        return start.AddHours(-(lead > TimeSpan.FromHours(LongLeadHours) ? LongLeadHours : ShortLeadHours));
    }

    public static bool Overlaps(TimeRange a, TimeRange b) => a.Start < b.End && b.Start < a.End;

    public static BookingConflicts Conflicts(TimeRange candidate, IEnumerable<BookingWindow> bookings)
    {
        var active = bookings.Where(booking => booking.Status is BookingStatus.Pending or BookingStatus.Confirmed).ToList();
        var overlapping = active.Where(booking => Overlaps(candidate, booking.Range)).Select(booking => booking.Id).ToList();
        var widened = new TimeRange(
            candidate.Start.AddMinutes(-MinGapBetweenBookingsMin),
            candidate.DurationMin + (2 * MinGapBetweenBookingsMin));
        var tooClose = active
            .Where(booking => !overlapping.Contains(booking.Id) && Overlaps(widened, booking.Range))
            .Select(booking => booking.Id)
            .ToList();

        return new BookingConflicts(overlapping, tooClose);
    }
}
