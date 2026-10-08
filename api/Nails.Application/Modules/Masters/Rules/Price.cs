using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public readonly record struct Price(PriceKind Kind, decimal Amount);
