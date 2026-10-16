using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Masters.Responses;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Services;

public sealed class BookingResponses(IAccountDirectory accounts, ICatalog catalog)
{
    public async Task<IReadOnlyDictionary<Guid, string>> ClientNamesAsync(IEnumerable<Booking> bookings, CancellationToken cancellationToken)
    {
        var ids = bookings.Where(booking => booking.ClientUserId is not null).Select(booking => booking.ClientUserId!.Value).Distinct().ToList();

        return ids.Count == 0 ? new Dictionary<Guid, string>() : await accounts.NamesAsync(ids, cancellationToken);
    }

    public async Task<BookingResponse> FromAsync(Booking booking, Master master, CancellationToken cancellationToken) =>
        From(booking, master.Name, master.PhotoUrl, await ClientNamesAsync([booking], cancellationToken));

    public BookingResponse From(Booking booking, string masterName, string? masterPhotoUrl, IReadOnlyDictionary<Guid, string> clientNames)
    {
        var clientName = booking.ClientUserId is { } clientId ? clientNames.GetValueOrDefault(clientId) : booking.ExternalClientName;

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
            masterName,
            masterPhotoUrl,
            clientName ?? ReviewerName.Anonymous);
    }
}
