using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Requests;

public sealed class OfferRequest
{
    [Required]
    [MaxLength(Offer.SlugMaxLength)]
    public required string ServiceId { get; init; }

    public required PriceKind PriceKind { get; init; }

    [Range(typeof(decimal), "0", Offer.MaxPrice, ParseLimitsInInvariantCulture = true, ConvertValueInInvariantCulture = true)]
    public required decimal Price { get; init; }

    [Range(Offer.MinDurationMinutes, Offer.MaxDurationMinutes)]
    public required int DurationMinutes { get; init; }
}
