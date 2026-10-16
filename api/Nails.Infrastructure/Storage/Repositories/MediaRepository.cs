using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Persistence;
using Nails.Infrastructure.Storage.Contracts;
using Nails.Infrastructure.Storage.Entities;

namespace Nails.Infrastructure.Storage.Repositories;

public sealed class MediaRepository(AppDbContext dbContext) : IMediaRepository
{
    public void Add(MediaFile file) => dbContext.Set<MediaFile>().Add(file);

    public Task<MediaFile?> FindAsync(Guid id, CancellationToken cancellationToken) =>
        dbContext.Set<MediaFile>().AsNoTracking().FirstOrDefaultAsync(file => file.Id == id, cancellationToken);

    public Task<bool> IsOwnedByAsync(Guid id, Guid userId, CancellationToken cancellationToken) =>
        dbContext.Set<MediaFile>().AnyAsync(file => file.Id == id && file.OwnerUserId == userId, cancellationToken);
}
