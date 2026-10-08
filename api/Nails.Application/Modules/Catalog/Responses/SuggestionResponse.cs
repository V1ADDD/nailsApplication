namespace Nails.Application.Modules.Catalog.Responses;

public sealed record SuggestionResponse(SuggestionKind Kind, string Id, string Name, string CategoryId, string CategoryName);
