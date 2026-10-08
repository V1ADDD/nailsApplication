using Starter.Infrastructure.Common;
using Starter.Infrastructure.Modules.Notes.Entities;

namespace Starter.Infrastructure.Modules.Notes.Contracts;

public interface INoteRepository
{
    Task<Note?> FindAsync(Guid id, CancellationToken cancellationToken);

    Task<Page<Note>> PageAsync(string? search, int page, int pageSize, CancellationToken cancellationToken);

    void Add(Note note);

    Task<int> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
