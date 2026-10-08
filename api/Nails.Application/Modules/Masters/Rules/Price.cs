using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public sealed record Price(PriceKind Kind, decimal? Amount)
{
    public decimal Value => Kind == PriceKind.Free ? 0 : Amount ?? 0;
}
