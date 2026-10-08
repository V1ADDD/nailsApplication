using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Seed;

public sealed record DemoBooking(
    string Master,
    string? Client,
    string SubcategoryId,
    DateTimeOffset StartAt,
    BookingStatus Status,
    Party CreatedBy = Party.Client,
    int CreatedMinutesAgo = DemoBooking.ThreeDaysMinutes,
    BookingSource Source = BookingSource.Site,
    string? ExternalClientName = null,
    string? Note = null,
    string? CancelReason = null,
    bool CancelMutual = false)
{
    public const int ThreeDaysMinutes = 3 * 24 * 60;
}
