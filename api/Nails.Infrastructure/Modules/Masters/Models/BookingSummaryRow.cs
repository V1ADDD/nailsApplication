namespace Nails.Infrastructure.Modules.Masters.Models;

public sealed class BookingSummaryRow
{
    public required Guid Id { get; init; }
    public required string MasterName { get; init; }
    public required string SubcategoryId { get; init; }
    public required DateTimeOffset StartAt { get; init; }
    public required int DurationMin { get; init; }
    public required string Address { get; init; }
}
