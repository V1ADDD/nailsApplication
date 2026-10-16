using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Contracts;

public sealed record BookingMoveCard(DateTimeOffset Start, int DurationMin, DateTimeOffset LapsesAt, BookingMoveStatus Status);
