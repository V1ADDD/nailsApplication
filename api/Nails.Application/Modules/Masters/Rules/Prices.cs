using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public static class Prices
{
    public static Price? Headline(IReadOnlyList<(Price Price, bool Addon)> services)
    {
        var main = services.Where(service => !service.Addon).Select(service => service.Price).ToList();
        var candidates = main.Count > 0 ? main : [.. services.Select(service => service.Price)];

        if (candidates.Count == 0)
        {
            return null;
        }

        var cheapest = candidates.MinBy(price => price.Value)!;

        if (candidates.Count == 1 || cheapest.Kind == PriceKind.Free)
        {
            return cheapest;
        }

        return new Price(PriceKind.From, cheapest.Amount);
    }

    public static bool InRange(Price price, decimal? from, decimal? to) =>
        (from is null || price.Value >= from) && (to is null || price.Value <= to);
}
