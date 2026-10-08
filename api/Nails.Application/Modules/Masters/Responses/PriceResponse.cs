using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Responses;

public sealed record PriceResponse(PriceKind Kind, decimal Amount);
