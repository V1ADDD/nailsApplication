using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public sealed record BookingState(BookingStatus Status, Party CreatedBy, DateTimeOffset Start, int DurationMin);
