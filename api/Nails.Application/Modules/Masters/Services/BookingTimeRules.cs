using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Events;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Services;

public sealed class BookingTimeRules(IBookingRepository bookings, BookingChanges changes, IBookingEvents events) : IBookingTimeRules
{
    private const string ReleaseReason = "Запись не подтверждена вовремя — окно освободилось";

    public async Task RunAsync(DateTimeOffset now, CancellationToken cancellationToken)
    {
        foreach (var booking in await bookings.AutoConfirmCandidatesAsync(now, cancellationToken))
        {
            await changes.ConfirmAsync(booking, now, cancellationToken);
            await SaveAsync(booking, BookingChangeKind.AutoConfirmed, null, cancellationToken);
        }

        foreach (var booking in await bookings.ReleaseCandidatesAsync(now.AddHours(Bookings.LongLeadHours), cancellationToken))
        {
            var state = BookingChanges.State(booking);

            if (Bookings.PendingReleaseAt(booking.StartAt, booking.CreatedAt) > now || BookingTransitions.Expire(state) is not null)
            {
                continue;
            }

            var side = BookingTransitions.ConfirmingSide(state);
            await changes.CancelAsync(booking, new BookingCancellation(side, ReleaseReason, true, true), now, cancellationToken);
            await SaveAsync(booking, BookingChangeKind.Expired, side, cancellationToken);
        }

        foreach (var booking in await bookings.CompleteCandidatesAsync(now, cancellationToken))
        {
            if (BookingTransitions.Complete(BookingChanges.State(booking), now) is not null)
            {
                continue;
            }

            booking.Status = BookingStatus.Completed;
            await SaveAsync(booking, BookingChangeKind.Completed, null, cancellationToken);
        }
    }

    private async Task SaveAsync(Booking booking, BookingChangeKind kind, Party? by, CancellationToken cancellationToken)
    {
        if (await bookings.SaveAsync(cancellationToken))
        {
            await events.PublishAsync([BookingChanges.Change(booking, kind, by)], cancellationToken);
        }
    }
}
