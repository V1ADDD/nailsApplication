using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using Nails.Application.Common.Media;

namespace Nails.Api.Host.Extensions;

public static class MediaEndpoints
{
    private const string Path = "/" + ModuleRoutes.ApiPrefix + "/media";
    private const string MultipartContentType = "multipart/form-data";
    private const long BodyLimitFactor = 2;

    public static IEndpointRouteBuilder MapNailsMedia(this IEndpointRouteBuilder endpoints)
    {
        var options = endpoints.ServiceProvider.GetRequiredService<IOptions<MediaOptions>>().Value;
        var bodyLimit = options.MaxBytes * BodyLimitFactor;

        endpoints.MapPost(Path, UploadAsync)
            .RequireAuthorization()
            .RequireRateLimiting(RateLimitingExtensions.MediaPolicy)
            .DisableAntiforgery()
            .Accepts<IFormFile>(MultipartContentType)
            .WithMetadata(new RequestSizeLimitAttribute(bodyLimit))
            .WithFormOptions(multipartBodyLengthLimit: bodyLimit)
            .WithName("UploadMedia");

        endpoints.MapGet(Path + "/{id:guid}", OpenAsync)
            .AllowAnonymous()
            .WithName("GetMedia");

        return endpoints;
    }

    private static async Task<Created<MediaResponse>> UploadAsync(IFormFile file, IMediaService media, CancellationToken cancellationToken)
    {
        await using var content = file.OpenReadStream();
        var response = await media.UploadAsync(content, file.Length, cancellationToken);

        return TypedResults.Created(response.Url, response);
    }

    private static async Task<FileStreamHttpResult> OpenAsync(
        Guid id,
        HttpContext context,
        IMediaService media,
        IOptions<MediaOptions> options,
        CancellationToken cancellationToken)
    {
        var file = await media.OpenAsync(id, cancellationToken);
        context.Response.Headers.CacheControl = $"private, max-age={options.Value.CacheSeconds}, immutable";

        return TypedResults.Stream(file.Content, file.ContentType, entityTag: new EntityTagHeaderValue(file.ETag));
    }
}
