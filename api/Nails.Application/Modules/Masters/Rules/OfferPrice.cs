using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public static class OfferPrice
{
    public static decimal? Normalize(PriceKind kind, decimal amount) => kind switch
    {
        PriceKind.Free => 0m,
        _ when amount > 0 && decimal.Round(amount, Offer.PriceScale) == amount => amount,
        _ => null
    };
}
