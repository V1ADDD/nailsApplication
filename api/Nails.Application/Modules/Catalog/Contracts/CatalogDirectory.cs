using Nails.Application.Modules.Catalog.Responses;

namespace Nails.Application.Modules.Catalog.Contracts;

public sealed class CatalogDirectory
{
    private readonly Dictionary<string, CategoryResponse> _categories;
    private readonly Dictionary<string, BeautyServiceResponse> _services;
    private readonly Dictionary<string, int> _positions;
    private readonly Dictionary<string, CityResponse> _cities;

    public CatalogDirectory(CatalogResponse catalog)
    {
        Categories = catalog.Categories;
        _categories = catalog.Categories.ToDictionary(category => category.Id, StringComparer.Ordinal);
        var services = catalog.Categories.SelectMany(category => category.Services).ToList();
        _services = services.ToDictionary(service => service.Id, StringComparer.Ordinal);
        _positions = services.Select((service, index) => (service.Id, index)).ToDictionary(pair => pair.Id, pair => pair.index, StringComparer.Ordinal);
        _cities = catalog.Cities.ToDictionary(city => city.Id, StringComparer.Ordinal);
    }

    public IReadOnlyList<CategoryResponse> Categories { get; }

    public CategoryResponse? FindCategory(string id) => _categories.GetValueOrDefault(id);

    public BeautyServiceResponse? FindService(string id) => _services.GetValueOrDefault(id);

    public CityResponse? FindCity(string id) => _cities.GetValueOrDefault(id);

    public int PositionOf(string serviceId) => _positions.GetValueOrDefault(serviceId, int.MaxValue);
}
