namespace Nails.Application.Modules.Masters.Rules;

public static class BookingMoves
{
    public static DateTimeOffset LapsesAt(DateTimeOffset newStart, DateTimeOffset bookingStart, DateTimeOffset now)
    {
        var deadline = Bookings.PendingReleaseAt(newStart, now);
        return deadline < bookingStart ? deadline : bookingStart;
    }
}
