using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Seed;

public sealed record DemoServiceRow(string SubcategoryId, PriceKind Kind, decimal? Amount, int DurationMin);
