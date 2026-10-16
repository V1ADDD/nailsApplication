namespace Nails.Application.Common.Media;

public interface IMediaService
{
    Task<MediaResponse> UploadAsync(Stream content, long length, CancellationToken cancellationToken);

    Task<MediaContent> OpenAsync(Guid id, CancellationToken cancellationToken);
}
