namespace Nails.Application.Common.Media;

public interface IMediaOwnership
{
    Task<bool> IsOwnedByAsync(string url, Guid userId, CancellationToken cancellationToken);
}
