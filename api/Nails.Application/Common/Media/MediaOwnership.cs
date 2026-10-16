using Nails.Infrastructure.Storage.Contracts;

namespace Nails.Application.Common.Media;

public sealed class MediaOwnership(IMediaRepository media) : IMediaOwnership
{
    public async Task<bool> IsOwnedByAsync(string url, Guid userId, CancellationToken cancellationToken) =>
        MediaUrls.IdOf(url) is { } id && await media.IsOwnedByAsync(id, userId, cancellationToken);
}
