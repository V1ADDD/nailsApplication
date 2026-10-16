namespace Nails.Application.Modules.Masters.Contracts;

public sealed record PairBooking(Guid BookingId, bool CreatedByMaster, DateTimeOffset CreatedAt);
