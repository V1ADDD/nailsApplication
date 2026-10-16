using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Events;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Masters.Services;

public sealed class BookingMoveService(
    IBookingRepository bookings,
    IBookingMoveRepository moves,
    BookingChanges changes,
    BookingResponses responses,
    IMyBookingService myBookings,
    IUnitOfWork unitOfWork,
    IBookingEvents events,
    ICurrentUser currentUser,
    TimeProvider clock) : IBookingMoveService
{
    public async Task<MyBookingResponse> RequestAsync(Guid bookingId, MoveBookingRequest request, CancellationToken cancellationToken)
    {
        var caller = currentUser.UserId;
        var now = clock.GetUtcNow();
        Booking? booking = null;

        await unitOfWork.InTransactionAsync(
            async token =>
            {
                (booking, var master) = await LoadAsync(bookingId, Party.Client, token);

                if (BookingTransitions.Move(BookingChanges.State(booking), now) is { } error)
                {
                    throw MastersErrors.For(error);
                }

                if (await moves.FindOpenAsync(booking.Id, token) is not null)
                {
                    throw MastersErrors.MoveExists();
                }

                var slot = await bookings.FindSlotAsync(request.SlotId!.Value, token);

                if (slot is null || slot.MasterId != booking.MasterId || slot.Status != SlotStatus.Free || slot.StartAt <= now)
                {
                    throw MastersErrors.SlotTaken();
                }

                var service = await bookings.FindServiceAsync(master.Id, booking.SubcategoryId, token) ?? throw MastersErrors.ServiceNotOffered();
                var duration = Math.Max(service.DurationMin, slot.DurationMin);
                var target = booking;
                var others = (await bookings.ClientActiveBookingsAsync(caller, now, token))
                    .Where(item => item.Id != target.Id)
                    .Select(item => new BookingWindow(item.Id, new TimeRange(item.StartAt, item.DurationMin), item.Status));
                var held = (await moves.OpenMovesOfClientAsync(caller, now, token))
                    .Where(item => item.BookingId != target.Id)
                    .Select(item => new BookingWindow(item.Id, new TimeRange(item.StartAt, item.DurationMin), BookingStatus.Pending));

                if (Bookings.Conflicts(new TimeRange(slot.StartAt, duration), [.. others, .. held]).Overlapping.Count > 0)
                {
                    throw MastersErrors.MoveOverlaps();
                }

                slot.Status = SlotStatus.Pending;
                slot.BookingId = booking.Id;
                moves.Add(new BookingMove
                {
                    Id = Guid.CreateVersion7(),
                    BookingId = booking.Id,
                    SlotId = slot.Id,
                    StartAt = slot.StartAt,
                    DurationMin = duration,
                    Status = BookingMoveStatus.Open,
                    LapsesAt = BookingMoves.LapsesAt(slot.StartAt, booking.StartAt, now)
                });

                if (!await bookings.SaveAsync(token))
                {
                    throw await moves.FindOpenAsync(booking.Id, token) is null ? MastersErrors.SlotTaken() : MastersErrors.MoveExists();
                }
            },
            cancellationToken);

        await events.PublishAsync([BookingChanges.Change(booking!, BookingChangeKind.MoveRequested, Party.Client)], cancellationToken);
        return await myBookings.FindAsync(bookingId, cancellationToken);
    }

    public async Task<MyBookingResponse> WithdrawAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var (booking, _) = await LoadAsync(bookingId, Party.Client, cancellationToken);
        await EndAsync(booking, BookingMoveStatus.Withdrawn, cancellationToken);
        await events.PublishAsync([BookingChanges.Change(booking, BookingChangeKind.MoveWithdrawn, Party.Client)], cancellationToken);
        return await myBookings.FindAsync(bookingId, cancellationToken);
    }

    public async Task<BookingResponse> AcceptAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var (booking, master) = await LoadAsync(bookingId, Party.Master, cancellationToken);
        var move = await moves.FindOpenAsync(booking.Id, cancellationToken) ?? throw MastersErrors.MoveNotOpen();
        await changes.AcceptMoveAsync(booking, move, clock.GetUtcNow(), cancellationToken);

        if (!await bookings.SaveAsync(cancellationToken))
        {
            throw MastersErrors.MoveNotOpen();
        }

        await events.PublishAsync([BookingChanges.Change(booking, BookingChangeKind.MoveAccepted, Party.Master)], cancellationToken);
        return await responses.FromAsync(booking, master, cancellationToken);
    }

    public async Task<BookingResponse> DeclineAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var (booking, master) = await LoadAsync(bookingId, Party.Master, cancellationToken);
        await EndAsync(booking, BookingMoveStatus.Declined, cancellationToken);
        await events.PublishAsync([BookingChanges.Change(booking, BookingChangeKind.MoveDeclined, Party.Master)], cancellationToken);
        return await responses.FromAsync(booking, master, cancellationToken);
    }

    private async Task EndAsync(Booking booking, BookingMoveStatus status, CancellationToken cancellationToken)
    {
        var move = await moves.FindOpenAsync(booking.Id, cancellationToken) ?? throw MastersErrors.MoveNotOpen();
        await changes.EndMoveAsync(move, status, clock.GetUtcNow(), cancellationToken);

        if (!await bookings.SaveAsync(cancellationToken))
        {
            throw MastersErrors.MoveNotOpen();
        }
    }

    private async Task<(Booking Booking, Master Master)> LoadAsync(Guid bookingId, Party side, CancellationToken cancellationToken)
    {
        var booking = await bookings.FindBookingAsync(bookingId, cancellationToken) ?? throw MastersErrors.BookingNotFound();
        var master = await bookings.FindMasterAsync(booking.MasterId, cancellationToken) ?? throw MastersErrors.BookingNotFound();
        var caller = currentUser.UserId;
        var allowed = side == Party.Client
            ? booking.ClientUserId == caller && booking.Source == BookingSource.Site
            : master.UserId == caller;

        return allowed ? (booking, master) : throw MastersErrors.NotBookingParty();
    }
}
