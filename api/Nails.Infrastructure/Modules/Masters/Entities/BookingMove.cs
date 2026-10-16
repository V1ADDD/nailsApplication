using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class BookingMove : IAuditable, IVersioned
{
    public Guid Id { get; set; }

    public Guid BookingId { get; set; }

    public Guid SlotId { get; set; }

    public DateTimeOffset StartAt { get; set; }

    public int DurationMin { get; set; }

    public BookingMoveStatus Status { get; set; }

    public DateTimeOffset LapsesAt { get; set; }

    public DateTimeOffset? ResolvedAt { get; set; }

    public long Version { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
