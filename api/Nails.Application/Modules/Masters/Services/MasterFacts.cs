using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Masters.Responses;
using Nails.Application.Modules.Masters.Rules;

namespace Nails.Application.Modules.Masters.Services;

public sealed class MasterFacts(ICatalog catalog)
{
    private const int RatingDecimals = 1;

    public static double? Rating(double? average) =>
        average is { } value ? Math.Round(value, RatingDecimals, MidpointRounding.AwayFromZero) : null;

    public static bool IsOnline(bool showOnline, Guid userId, IReadOnlySet<Guid> online) =>
        showOnline && online.Contains(userId);

    public static PriceResponse? ToResponse(Price? price) => price is null ? null : new PriceResponse(price.Kind, price.Amount);

    public Price? Headline(IEnumerable<(string SubcategoryId, Price Price)> services) =>
        Prices.Headline([.. services.Select(service =>
            (service.Price, catalog.FindSubcategory(service.SubcategoryId)?.Addon ?? false))]);
}
