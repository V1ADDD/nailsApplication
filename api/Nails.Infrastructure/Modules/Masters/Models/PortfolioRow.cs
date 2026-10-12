namespace Nails.Infrastructure.Modules.Masters.Models;

public sealed class PortfolioRow
{
    public required Guid Id { get; init; }
    public string? Url { get; init; }
    public required int Hue { get; init; }
    public string? Caption { get; init; }
}
