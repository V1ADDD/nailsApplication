namespace Nails.Infrastructure.Modules.Masters.Models;

public sealed class ReviewRow
{
    public required Guid Id { get; init; }
    public required Guid ClientUserId { get; init; }
    public required string SubcategoryId { get; init; }
    public required int Rating { get; init; }
    public required string Text { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}
