using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nails.Application.Modules.Help.Contracts;
using Nails.Application.Modules.Help.Responses;

namespace Nails.Api.Modules.Help.Controllers;

[ApiController]
[Route("content")]
[AllowAnonymous]
public sealed class HelpController(IHelpService help) : ControllerBase
{
    [HttpGet]
    public HelpContentResponse Get([FromQuery] string? language) => help.Content(language);
}
