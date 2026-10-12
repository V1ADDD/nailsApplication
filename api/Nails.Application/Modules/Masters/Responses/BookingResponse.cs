using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Responses;

public sealed record BookingResponse(
    Guid Id,
    Guid MasterId,
    Guid? ClientUserId,
    Guid? SlotId,
    string SubcategoryId,
    string ServiceName,
    PriceResponse Price,
    DateTimeOffset Start,
    int DurationMin,
    string Address,
    BookingStatus Status,
    BookingSource Source,
    Party CreatedBy,
    DateTimeOffset? ConfirmedAt,
    DateTimeOffset? ReleaseAt,
    DateTimeOffset? CancelledAt,
    Party? CancelledBy,
    string? CancelReason,
    bool CancelMutual,
    bool CancelExpired,
    string MasterName,
    string? MasterPhotoUrl,
    string ClientName);
