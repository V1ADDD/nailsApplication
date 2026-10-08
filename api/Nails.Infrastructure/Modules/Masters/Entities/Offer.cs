using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class Offer : IAuditable
{
    public const int SlugMaxLength = 64;
    public const int PricePrecision = 10;
    public const int PriceScale = 2;
    public const int MinDurationMinutes = 5;
    public const int MaxDurationMinutes = 720;
    public const string MaxPrice = "100000";

    public Guid Id { get; set; }

    public Guid MasterId { get; set; }

    public string ServiceId { get; set; } = string.Empty;

    public string CategoryId { get; set; } = string.Empty;

    public PriceKind PriceKind { get; set; }

    public decimal Price { get; set; }

    public int DurationMinutes { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
