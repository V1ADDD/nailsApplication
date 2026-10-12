using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public sealed record BookingWindow(Guid Id, TimeRange Range, BookingStatus Status);
