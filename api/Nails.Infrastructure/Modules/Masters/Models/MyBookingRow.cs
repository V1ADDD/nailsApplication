using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Infrastructure.Modules.Masters.Models;

public sealed class MyBookingRow
{
    public required Booking Booking { get; init; }

    public required Guid MasterUserId { get; init; }

    public required string MasterName { get; init; }

    public string? MasterPhotoUrl { get; init; }

    public Review? ClientReview { get; init; }

    public BookingMove? OpenMove { get; init; }
}
