using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public static class MyBookingScope
{
    public static bool IsUpcoming(BookingStatus status, DateTimeOffset start, DateTimeOffset now) =>
        status is BookingStatus.Pending or BookingStatus.Confirmed && start > now;
}
