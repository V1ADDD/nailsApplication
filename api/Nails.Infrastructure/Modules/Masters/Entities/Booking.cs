using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class Booking : IAuditable, IVersioned
{
    public const int ClientNameMaxLength = 120;
    public const int CancelReasonMaxLength = 300;
    public const int NoteMaxLength = 1000;

    public Guid Id { get; set; }

    public Guid MasterId { get; set; }

    public Guid? ClientUserId { get; set; }

    public string? ExternalClientName { get; set; }

    public string SubcategoryId { get; set; } = string.Empty;

    public PriceKind PriceKind { get; set; }

    public decimal? PriceAmount { get; set; }

    public DateTimeOffset StartAt { get; set; }

    public int DurationMin { get; set; }

    public string Address { get; set; } = string.Empty;

    public BookingStatus Status { get; set; }

    public BookingSource Source { get; set; }

    public Party CreatedBy { get; set; }

    public DateTimeOffset? ConfirmedAt { get; set; }

    public DateTimeOffset? CancelledAt { get; set; }

    public Party? CancelledBy { get; set; }

    public string? CancelReason { get; set; }

    public bool CancelMutual { get; set; }

    public bool CancelExpired { get; set; }

    public string? Note { get; set; }

    public Guid? SlotId { get; set; }

    public long Version { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
