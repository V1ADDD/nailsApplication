using Nails.Application.Modules.Masters.Events;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Services;

public sealed class BookingChanges(IBookingRepository bookings)
{
    public static BookingState State(Booking booking) => new(booking.Status, booking.CreatedBy, booking.StartAt, booking.DurationMin);

    public static BookingChanged Change(Booking booking, BookingChangeKind kind, Party? by) =>
        new(booking.Id, booking.MasterId, booking.ClientUserId, kind, by);

    public Task ConfirmAsync(Booking booking, DateTimeOffset now, CancellationToken cancellationToken)
    {
        booking.Status = BookingStatus.Confirmed;
        booking.ConfirmedAt = now;
        return SetSlotAsync(booking, SlotStatus.Booked, cancellationToken);
    }

    public Task CancelAsync(Booking booking, BookingCancellation cancellation, DateTimeOffset now, CancellationToken cancellationToken)
    {
        booking.Status = BookingStatus.Cancelled;
        booking.CancelledAt = now;
        booking.CancelledBy = cancellation.By;
        booking.CancelReason = cancellation.Reason;
        booking.CancelMutual = cancellation.Mutual;
        booking.CancelExpired = cancellation.Expired;
        return SetSlotAsync(booking, SlotStatus.Free, cancellationToken);
    }

    private async Task SetSlotAsync(Booking booking, SlotStatus status, CancellationToken cancellationToken)
    {
        if (booking.SlotId is not { } slotId || await bookings.FindSlotAsync(slotId, cancellationToken) is not { } slot)
        {
            return;
        }

        slot.Status = status;
        slot.BookingId = status == SlotStatus.Free ? null : booking.Id;
    }
}
