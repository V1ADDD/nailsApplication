using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Events;

public sealed record BookingChanged(Guid BookingId, Guid MasterId, Guid? ClientUserId, BookingChangeKind Kind, Party? By);
