using System.Globalization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Infrastructure.Persistence.Contracts;
using Nails.Infrastructure.Storage.Contracts;
using Nails.Infrastructure.Storage.Entities;

namespace Nails.Application.Common.Media;

public sealed partial class MediaService(
    IFileStorage storage,
    IMediaRepository media,
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser,
    TimeProvider clock,
    IOptions<MediaOptions> options,
    ILogger<MediaService> logger) : IMediaService
{
    public async Task<MediaResponse> UploadAsync(Stream content, long length, CancellationToken cancellationToken)
    {
        if (length > options.Value.MaxBytes)
        {
            throw MediaErrors.TooLarge();
        }

        var header = new byte[ImageSignature.HeaderLength];
        var read = await content.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false, cancellationToken);
        var contentType = ImageSignature.ContentTypeOf(header.AsSpan(0, read));

        if (contentType is null || !options.Value.ContentTypes.Contains(contentType, StringComparer.Ordinal))
        {
            throw MediaErrors.WrongType();
        }

        content.Seek(0, SeekOrigin.Begin);

        var id = Guid.CreateVersion7();
        var now = clock.GetUtcNow();
        var key = string.Create(
            CultureInfo.InvariantCulture,
            $"{now:yyyy}/{now:MM}/{id:D}.{ImageSignature.ExtensionOf(contentType)}");

        await storage.SaveAsync(key, content, cancellationToken);

        media.Add(new MediaFile
        {
            Id = id,
            OwnerUserId = currentUser.UserId,
            ContentType = contentType,
            SizeBytes = length,
            StorageKey = key
        });
        await unitOfWork.SaveChangesAsync(cancellationToken);

        LogUploaded(logger, id, contentType, length);

        return new MediaResponse(id, MediaUrls.For(id));
    }

    public async Task<MediaContent> OpenAsync(Guid id, CancellationToken cancellationToken)
    {
        var file = await media.FindAsync(id, cancellationToken) ?? throw MediaErrors.NotFound();

        return new MediaContent(file.ContentType, $"\"{file.Id:N}\"", storage.OpenRead(file.StorageKey));
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Media {MediaId} uploaded ({ContentType}, {SizeBytes} bytes)")]
    private static partial void LogUploaded(ILogger logger, Guid mediaId, string contentType, long sizeBytes);
}
