using Nails.Infrastructure.Modules.Catalog.Entities;

namespace Nails.Infrastructure.Modules.Catalog.Contracts;

public interface ICatalogRepository
{
    Task<IReadOnlyList<Category>> CategoriesAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<BeautyService>> ServicesAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<City>> CitiesAsync(CancellationToken cancellationToken);
}
