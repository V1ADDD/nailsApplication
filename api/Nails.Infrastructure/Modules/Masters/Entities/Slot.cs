using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class Slot : IAuditable, IVersioned
{
    public Guid Id { get; set; }

    public Guid MasterId { get; set; }

    public DateTimeOffset StartAt { get; set; }

    public int DurationMin { get; set; }

    public SlotStatus Status { get; set; }

    public Guid? BookingId { get; set; }

    public long Version { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
