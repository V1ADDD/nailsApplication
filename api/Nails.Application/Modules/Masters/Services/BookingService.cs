using Nails.Application.Modules.Catalog.Contracts;
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

public sealed class BookingService(
    IBookingRepository bookings,
    IBookingMoveRepository moves,
    BookingChanges changes,
    IUnitOfWork unitOfWork,
    IBookingEvents events,
    BookingResponses responses,
    ICatalog catalog,
    ICurrentUser currentUser,
    TimeProvider clock) : IBookingService
{
    private const string AutoCancelReason = "Автоматически: новая запись на это же время";

    public async Task<ConflictsResponse> ConflictsAsync(ConflictsRequest request, CancellationToken cancellationToken)
    {
        var slot = await bookings.FindSlotAsync(request.SlotId, cancellationToken) ?? throw MastersErrors.SlotNotFound();
        var active = await bookings.ClientActiveBookingsAsync(currentUser.UserId, clock.GetUtcNow(), cancellationToken);
        var conflicts = Bookings.Conflicts(new TimeRange(slot.StartAt, slot.DurationMin), active.Select(Window));

        return new ConflictsResponse(
            await SummariesAsync(conflicts.Overlapping, cancellationToken),
            await SummariesAsync(conflicts.TooClose, cancellationToken));
    }

    public async Task<CreateBookingResponse> CreateAsync(CreateBookingRequest request, CancellationToken cancellationToken)
    {
        var caller = currentUser.UserId;
        var now = clock.GetUtcNow();
        Master? master = null;
        Booking? booking = null;
        var conflicts = new BookingConflicts([], []);
        List<Booking> autoCancelled = [];
        List<Guid> withdrawnMoves = [];

        await unitOfWork.InTransactionAsync(
            async token =>
            {
                autoCancelled.Clear();
                withdrawnMoves.Clear();
                master = await bookings.FindMasterAsync(request.MasterId, token) is { DeletedAt: null } found
                    && await bookings.MasterListedAsync(found.Id, token)
                    ? found
                    : throw MastersErrors.MasterNotFound();
                var slot = await bookings.FindSlotAsync(request.SlotId, token);

                if (slot is null || slot.MasterId != master.Id || slot.Status != SlotStatus.Free)
                {
                    throw MastersErrors.SlotTaken();
                }

                if (master.UserId == caller)
                {
                    throw MastersErrors.SelfBooking();
                }

                var service = await bookings.FindServiceAsync(master.Id, request.SubcategoryId, token)
                    ?? throw MastersErrors.ServiceNotOffered();
                var duration = Math.Max(service.DurationMin, slot.DurationMin);
                var active = await bookings.ClientActiveBookingsAsync(caller, now, token);
                var range = new TimeRange(slot.StartAt, duration);
                conflicts = Bookings.Conflicts(range, active.Select(Window));

                foreach (var held in await moves.OpenMovesOfClientAsync(caller, now, token))
                {
                    if (Bookings.Overlaps(range, new TimeRange(held.StartAt, held.DurationMin)))
                    {
                        await changes.EndMoveAsync(held, BookingMoveStatus.Withdrawn, now, token);
                        withdrawnMoves.Add(held.BookingId);
                    }
                }

                foreach (var overlapping in active.Where(item => conflicts.Overlapping.Contains(item.Id)))
                {
                    await changes.CancelAsync(overlapping, new BookingCancellation(Party.Client, AutoCancelReason, true, false), now, token);
                    autoCancelled.Add(overlapping);
                }

                booking = new Booking
                {
                    Id = Guid.CreateVersion7(),
                    MasterId = master.Id,
                    ClientUserId = caller,
                    SubcategoryId = service.SubcategoryId,
                    PriceKind = service.PriceKind,
                    PriceAmount = service.PriceAmount,
                    StartAt = slot.StartAt,
                    DurationMin = duration,
                    Address = master.Address,
                    Status = BookingStatus.Pending,
                    Source = BookingSource.Site,
                    CreatedBy = Party.Client,
                    SlotId = slot.Id
                };
                bookings.Add(booking);
                slot.Status = SlotStatus.Pending;
                slot.BookingId = booking.Id;

                if (!await bookings.SaveAsync(token))
                {
                    throw MastersErrors.SlotTaken();
                }
            },
            cancellationToken);

        await events.PublishAsync(
            [
                BookingChanges.Change(booking!, BookingChangeKind.Created, Party.Client),
                .. autoCancelled.Select(cancelled => BookingChanges.Change(cancelled, BookingChangeKind.AutoCancelled, Party.Client)),
                .. await WithdrawnChangesAsync(withdrawnMoves, cancellationToken)
            ],
            cancellationToken);

        return new CreateBookingResponse(
            await responses.FromAsync(booking!, master!, cancellationToken),
            await SummariesAsync(conflicts.Overlapping, cancellationToken),
            await SummariesAsync(conflicts.TooClose, cancellationToken));
    }

    public async Task<BookingResponse> ConfirmAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var (booking, master, side) = await LoadAsync(bookingId, cancellationToken);
        if (BookingTransitions.Confirm(BookingChanges.State(booking), side) is { } error)
        {
            throw MastersErrors.For(error);
        }

        await changes.ConfirmAsync(booking, clock.GetUtcNow(), cancellationToken);

        if (!await bookings.SaveAsync(cancellationToken))
        {
            throw MastersErrors.NotPending();
        }

        await events.PublishAsync([BookingChanges.Change(booking, BookingChangeKind.Confirmed, side)], cancellationToken);
        return await responses.FromAsync(booking, master, cancellationToken);
    }

    public async Task<BookingResponse> CancelAsync(Guid bookingId, CancelBookingRequest request, CancellationToken cancellationToken)
    {
        var (booking, master, side) = await LoadAsync(bookingId, cancellationToken);
        if (BookingTransitions.Cancel(BookingChanges.State(booking)) is { } error)
        {
            throw MastersErrors.For(error);
        }

        var cancellation = new BookingCancellation(side, request.Reason.Trim(), request.Mutual, false);
        await changes.CancelAsync(booking, cancellation, clock.GetUtcNow(), cancellationToken);

        if (!await bookings.SaveAsync(cancellationToken))
        {
            throw MastersErrors.CannotCancel();
        }

        await events.PublishAsync([BookingChanges.Change(booking, BookingChangeKind.Cancelled, side)], cancellationToken);
        return await responses.FromAsync(booking, master, cancellationToken);
    }

    private async Task<(Booking Booking, Master Master, Party Side)> LoadAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var booking = await bookings.FindBookingAsync(bookingId, cancellationToken) ?? throw MastersErrors.BookingNotFound();
        var master = await bookings.FindMasterAsync(booking.MasterId, cancellationToken) ?? throw MastersErrors.BookingNotFound();
        var caller = currentUser.UserId;

        if (booking.ClientUserId == caller)
        {
            return (booking, master, Party.Client);
        }

        return master.UserId == caller ? (booking, master, Party.Master) : throw MastersErrors.NotBookingParty();
    }

    private async Task<IReadOnlyList<BookingSummaryResponse>> SummariesAsync(IReadOnlyList<Guid> ids, CancellationToken cancellationToken) =>
        [.. (await bookings.SummariesAsync(ids, cancellationToken)).Select(row => new BookingSummaryResponse(
            row.Id,
            row.MasterName,
            catalog.SubcategoryName(row.SubcategoryId),
            row.StartAt,
            row.DurationMin,
            row.Address))];

    private async Task<IReadOnlyList<BookingChanged>> WithdrawnChangesAsync(IReadOnlyList<Guid> bookingIds, CancellationToken cancellationToken)
    {
        var result = new List<BookingChanged>();

        foreach (var bookingId in bookingIds)
        {
            if (await bookings.FindBookingAsync(bookingId, cancellationToken) is { } moved)
            {
                result.Add(BookingChanges.Change(moved, BookingChangeKind.MoveWithdrawn, Party.Client));
            }
        }

        return result;
    }

    private static BookingWindow Window(Booking booking) =>
        new(booking.Id, new TimeRange(booking.StartAt, booking.DurationMin), booking.Status);
}
