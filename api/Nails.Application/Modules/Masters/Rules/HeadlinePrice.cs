using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public static class HeadlinePrice
{
    public static Price For(IReadOnlyCollection<Price> prices)
    {
        if (prices.Count == 0)
        {
            throw new ArgumentException("A headline price needs at least one price.", nameof(prices));
        }

        if (prices.Count == 1)
        {
            return prices.First();
        }

        var paid = prices.Where(price => price.Kind != PriceKind.Free).ToList();

        return paid.Count == 0
            ? new Price(PriceKind.Free, 0m)
            : new Price(PriceKind.From, paid.Min(price => price.Amount));
    }
}
