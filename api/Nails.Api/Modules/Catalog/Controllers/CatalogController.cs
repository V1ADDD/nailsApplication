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
    [HttpGet]
    public Task<CatalogResponse> Get(CancellationToken cancellationToken) => catalog.GetAsync(cancellationToken);
}
