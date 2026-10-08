using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Catalog.Contracts;
using Nails.Infrastructure.Modules.Catalog.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Catalog.Repositories;

public sealed class CatalogRepository(AppDbContext dbContext) : ICatalogRepository
{
    public async Task<IReadOnlyList<Category>> CategoriesAsync(CancellationToken cancellationToken) =>
        await dbContext.Set<Category>().AsNoTracking().OrderBy(category => category.SortOrder).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<BeautyService>> ServicesAsync(CancellationToken cancellationToken) =>
        await dbContext.Set<BeautyService>().AsNoTracking().OrderBy(service => service.SortOrder).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<City>> CitiesAsync(CancellationToken cancellationToken) =>
        await dbContext.Set<City>().AsNoTracking().OrderBy(city => city.SortOrder).ToListAsync(cancellationToken);
}
