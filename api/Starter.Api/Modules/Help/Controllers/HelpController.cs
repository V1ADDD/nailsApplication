using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Starter.Application.Modules.Help.Contracts;
using Starter.Application.Modules.Help.Responses;

namespace Starter.Api.Modules.Help.Controllers;

[ApiController]
[Route("content")]
[AllowAnonymous]
public sealed class HelpController(IHelpService help) : ControllerBase
{
    [HttpGet]
    public HelpContentResponse Get([FromQuery] string? language) => help.Content(language);
}
