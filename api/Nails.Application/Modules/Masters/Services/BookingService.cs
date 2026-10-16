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
    BookingChanges changes,
    IUnitOfWork unitOfWork,
    IBookingEvents events,
    IAccountDirectory accounts,
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

        await unitOfWork.InTransactionAsync(
            async token =>
            {
                autoCancelled.Clear();
                master = await bookings.FindMasterAsync(request.MasterId, token) is { DeletedAt: null } found
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
                conflicts = Bookings.Conflicts(new TimeRange(slot.StartAt, duration), active.Select(Window));

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
                .. autoCancelled.Select(cancelled => BookingChanges.Change(cancelled, BookingChangeKind.AutoCancelled, Party.Client))
            ],
            cancellationToken);

        return new CreateBookingResponse(
            await ToResponseAsync(booking!, master!, cancellationToken),
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
        return await ToResponseAsync(booking, master, cancellationToken);
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
        return await ToResponseAsync(booking, master, cancellationToken);
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

    private async Task<BookingResponse> ToResponseAsync(Booking booking, Master master, CancellationToken cancellationToken)
    {
        var clientName = booking.ExternalClientName;

        if (booking.ClientUserId is { } clientId)
        {
            var names = await accounts.NamesAsync([clientId], cancellationToken);
            clientName = names.GetValueOrDefault(clientId);
        }

        return new BookingResponse(
            booking.Id,
            booking.MasterId,
            booking.ClientUserId,
            booking.SlotId,
            booking.SubcategoryId,
            catalog.SubcategoryName(booking.SubcategoryId),
            new PriceResponse(booking.PriceKind, booking.PriceAmount),
            booking.StartAt,
            booking.DurationMin,
            booking.Address,
            booking.Status,
            booking.Source,
            booking.CreatedBy,
            booking.ConfirmedAt,
            booking.Status == BookingStatus.Pending ? Bookings.PendingReleaseAt(booking.StartAt, booking.CreatedAt) : null,
            booking.CancelledAt,
            booking.CancelledBy,
            booking.CancelReason,
            booking.CancelMutual,
            booking.CancelExpired,
            master.Name,
            master.PhotoUrl,
            clientName ?? ReviewerName.Anonymous);
    }

    private async Task<IReadOnlyList<BookingSummaryResponse>> SummariesAsync(IReadOnlyList<Guid> ids, CancellationToken cancellationToken) =>
        [.. (await bookings.SummariesAsync(ids, cancellationToken)).Select(row => new BookingSummaryResponse(
            row.Id,
            row.MasterName,
            catalog.SubcategoryName(row.SubcategoryId),
            row.StartAt,
            row.DurationMin,
            row.Address))];

    private static BookingWindow Window(Booking booking) =>
        new(booking.Id, new TimeRange(booking.StartAt, booking.DurationMin), booking.Status);
}
