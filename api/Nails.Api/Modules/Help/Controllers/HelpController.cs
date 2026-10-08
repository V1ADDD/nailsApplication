using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using Nails.Application.Modules.Help.Contracts;
using Nails.Application.Modules.Help.Responses;
using Nails.Infrastructure.Modules.Help.Options;

namespace Nails.Api.Modules.Help.Controllers;

[ApiController]
[Route("")]
[AllowAnonymous]
public sealed class HelpController(IHelpService help, IOptions<HelpImageOptions> imageOptions) : ControllerBase
{
    private const string NoCache = "no-cache";

    [HttpGet("content")]
    public HelpContentResponse Get([FromQuery] string? language) =>
        help.Content(
            language,
            image => Url.Action(
                nameof(GetImage),
                new { language = image.Language, articleId = image.ArticleId, fileName = image.FileName, v = image.Version })
                ?? string.Empty);

    [HttpGet("images/{language}/{articleId}/{fileName}")]
    public IActionResult GetImage(string language, string articleId, string fileName)
    {
        var image = help.Image(language, articleId, fileName);
        var cacheSeconds = imageOptions.Value.CacheSeconds;

        Response.Headers[HeaderNames.CacheControl] = cacheSeconds > 0
            ? string.Create(CultureInfo.InvariantCulture, $"public, max-age={cacheSeconds}, immutable")
            : NoCache;

        return PhysicalFile(image.FullPath, image.ContentType, lastModified: null, entityTag: new EntityTagHeaderValue($"\"{image.Version}\""));
    }
}
