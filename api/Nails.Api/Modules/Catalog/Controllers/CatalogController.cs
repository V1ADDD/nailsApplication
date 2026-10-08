using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Catalog.Responses;

namespace Nails.Api.Modules.Catalog.Controllers;

[ApiController]
[Route("")]
[AllowAnonymous]
public sealed class CatalogController(ICatalogService catalog) : ControllerBase
{
    private const int MaxQueryLength = 100;
    private const int CacheSeconds = 3600;

    [HttpGet]
    [ResponseCache(Duration = CacheSeconds, Location = ResponseCacheLocation.Any)]
    public IReadOnlyList<CategoryResponse> Get() => catalog.Categories();

    [HttpGet("suggestions")]
    public IReadOnlyList<SuggestionResponse> Suggestions([FromQuery, MaxLength(MaxQueryLength)] string? q) => catalog.Suggestions(q);
}
