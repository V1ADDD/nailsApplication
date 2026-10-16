using Nails.Infrastructure.Storage.Entities;

namespace Nails.Infrastructure.Storage.Contracts;

public interface IMediaRepository
{
    void Add(MediaFile file);

    Task<MediaFile?> FindAsync(Guid id, CancellationToken cancellationToken);

    Task<bool> IsOwnedByAsync(Guid id, Guid userId, CancellationToken cancellationToken);
}
