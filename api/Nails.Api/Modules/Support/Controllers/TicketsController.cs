using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Nails.Application.Modules.Support;
using Nails.Application.Modules.Support.Contracts;
using Nails.Application.Modules.Support.Requests;
using Nails.Application.Modules.Support.Responses;

namespace Nails.Api.Modules.Support.Controllers;

[ApiController]
[Route("tickets")]
[AllowAnonymous]
[EnableRateLimiting(SupportModule.RateLimitPolicy)]
public sealed class TicketsController(ISupportTicketService tickets) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<CreateSupportTicketResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CreateSupportTicketRequest request, CancellationToken cancellationToken)
    {
        var response = await tickets.CreateAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, response);
    }
}
