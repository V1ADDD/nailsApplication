using Nails.Application.Modules.Masters.Responses;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Contracts;

public sealed record BookingCard(
    Guid Id,
    Guid MasterId,
    Guid? ClientUserId,
    string SubcategoryId,
    string ServiceName,
    PriceResponse Price,
    DateTimeOffset Start,
    int DurationMin,
    BookingStatus Status,
    Party CreatedBy,
    Party? CancelledBy,
    string? CancelReason,
    bool CancelMutual,
    bool CancelExpired,
    DateTimeOffset? ReleaseAt);
