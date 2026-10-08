using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class Review : IAuditable
{
    public const int TextMaxLength = 1000;

    public Guid Id { get; set; }

    public Guid? BookingId { get; set; }

    public Guid MasterId { get; set; }

    public Guid ClientUserId { get; set; }

    public Party AuthorRole { get; set; }

    public string SubcategoryId { get; set; } = string.Empty;

    public int Rating { get; set; }

    public string Text { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
