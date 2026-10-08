using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Masters.Responses;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Services;

public static class MasterResponses
{
    public static MasterResponse Master(MasterProfile profile, IEnumerable<Offer> offers, CatalogDirectory catalog) =>
        new(
            profile.Id,
            profile.DisplayName,
            profile.About,
            profile.Phone,
            profile.CityId,
            CityName(profile.CityId, catalog),
            profile.Address,
            profile.Version,
            [.. offers.OrderBy(offer => catalog.PositionOf(offer.ServiceId)).Select(offer => Offer(offer, catalog))]);

    public static OfferResponse Offer(Offer offer, CatalogDirectory catalog) =>
        new(
            offer.Id,
            offer.ServiceId,
            catalog.FindService(offer.ServiceId)?.Name ?? offer.ServiceId,
            offer.CategoryId,
            catalog.FindCategory(offer.CategoryId)?.Name ?? offer.CategoryId,
            Price(new Price(offer.PriceKind, offer.Price)),
            offer.DurationMinutes);

    public static PriceResponse Price(Price price) => new(price.Kind, price.Amount);

    public static string CityName(string cityId, CatalogDirectory catalog) => catalog.FindCity(cityId)?.Name ?? cityId;
}
