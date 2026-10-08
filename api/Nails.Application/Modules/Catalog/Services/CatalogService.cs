using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Catalog.Responses;
using Nails.Infrastructure.Modules.Catalog.Contracts;

namespace Nails.Application.Modules.Catalog.Services;

public sealed class CatalogService(ICatalogRepository catalog) : ICatalogService
{
    public async Task<CatalogResponse> GetAsync(CancellationToken cancellationToken)
    {
        var categories = await catalog.CategoriesAsync(cancellationToken);
        var services = await catalog.ServicesAsync(cancellationToken);
        var cities = await catalog.CitiesAsync(cancellationToken);
        var servicesByCategory = services.ToLookup(service => service.CategoryId, StringComparer.Ordinal);

        return new CatalogResponse(
            [.. categories.Select(category => new CategoryResponse(
                category.Id,
                category.Name,
                [.. servicesByCategory[category.Id].Select(service => new BeautyServiceResponse(service.Id, service.Name, service.CategoryId))]))],
            [.. cities.Select(city => new CityResponse(city.Id, city.Name))]);
    }

    public async Task<CatalogDirectory> GetDirectoryAsync(CancellationToken cancellationToken) =>
        new(await GetAsync(cancellationToken));
}
