using Nails.Application.Modules.Masters.Events;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Services;

public sealed class BookingChanges(IBookingRepository bookings, IBookingMoveRepository moves)
{
    public static BookingState State(Booking booking) => new(booking.Status, booking.CreatedBy, booking.StartAt, booking.DurationMin);

    public static BookingChanged Change(Booking booking, BookingChangeKind kind, Party? by) =>
        new(booking.Id, booking.MasterId, booking.ClientUserId, kind, by);

    public Task ConfirmAsync(Booking booking, DateTimeOffset now, CancellationToken cancellationToken)
    {
        booking.Status = BookingStatus.Confirmed;
        booking.ConfirmedAt = now;
        return SetSlotAsync(booking.SlotId, booking.Id, SlotStatus.Booked, cancellationToken);
    }

    public async Task CancelAsync(Booking booking, BookingCancellation cancellation, DateTimeOffset now, CancellationToken cancellationToken)
    {
        booking.Status = BookingStatus.Cancelled;
        booking.CancelledAt = now;
        booking.CancelledBy = cancellation.By;
        booking.CancelReason = cancellation.Reason;
        booking.CancelMutual = cancellation.Mutual;
        booking.CancelExpired = cancellation.Expired;
        await SetSlotAsync(booking.SlotId, booking.Id, SlotStatus.Free, cancellationToken);

        if (await moves.FindOpenAsync(booking.Id, cancellationToken) is { } move)
        {
            await EndMoveAsync(move, BookingMoveStatus.Cancelled, now, cancellationToken);
        }
    }

    public async Task EndMoveAsync(BookingMove move, BookingMoveStatus status, DateTimeOffset now, CancellationToken cancellationToken)
    {
        move.Status = status;
        move.ResolvedAt = now;
        await SetSlotAsync(move.SlotId, move.BookingId, SlotStatus.Free, cancellationToken);
    }

    public async Task AcceptMoveAsync(Booking booking, BookingMove move, DateTimeOffset now, CancellationToken cancellationToken)
    {
        await SetSlotAsync(booking.SlotId, booking.Id, SlotStatus.Free, cancellationToken);
        booking.StartAt = move.StartAt;
        booking.DurationMin = move.DurationMin;
        booking.SlotId = move.SlotId;
        booking.Status = BookingStatus.Confirmed;
        booking.ConfirmedAt = now;
        move.Status = BookingMoveStatus.Accepted;
        move.ResolvedAt = now;
        await SetSlotAsync(move.SlotId, booking.Id, SlotStatus.Booked, cancellationToken);
    }

    private async Task SetSlotAsync(Guid? slotId, Guid bookingId, SlotStatus status, CancellationToken cancellationToken)
    {
        if (slotId is not { } id || await bookings.FindSlotAsync(id, cancellationToken) is not { } slot)
        {
            return;
        }

        slot.Status = status;
        slot.BookingId = status == SlotStatus.Free ? null : bookingId;
    }
}
