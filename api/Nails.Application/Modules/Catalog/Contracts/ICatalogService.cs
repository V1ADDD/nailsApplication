using Nails.Application.Modules.Catalog.Responses;

namespace Nails.Application.Modules.Catalog.Contracts;

public interface ICatalogService
{
    IReadOnlyList<CategoryResponse> Categories();

    IReadOnlyList<SuggestionResponse> Suggestions(string? query);
}
