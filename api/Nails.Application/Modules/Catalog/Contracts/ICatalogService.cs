using Nails.Application.Modules.Catalog.Responses;

namespace Nails.Application.Modules.Catalog.Contracts;

public interface ICatalogService
{
    Task<CatalogResponse> GetAsync(CancellationToken cancellationToken);

    Task<CatalogDirectory> GetDirectoryAsync(CancellationToken cancellationToken);
}
