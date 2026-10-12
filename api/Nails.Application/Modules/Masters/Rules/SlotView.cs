using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public sealed record SlotView(Guid Id, DateTimeOffset StartAt, int DurationMin, SlotStatus Status);
