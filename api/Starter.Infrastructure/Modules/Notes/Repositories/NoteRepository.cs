using Microsoft.EntityFrameworkCore;
using Starter.Infrastructure.Common;
using Starter.Infrastructure.Modules.Notes.Contracts;
using Starter.Infrastructure.Modules.Notes.Entities;
using Starter.Infrastructure.Persistence;

namespace Starter.Infrastructure.Modules.Notes.Repositories;

public sealed class NoteRepository(AppDbContext dbContext) : INoteRepository
{
    public Task<Note?> FindAsync(Guid id, CancellationToken cancellationToken) =>
        dbContext.Set<Note>().SingleOrDefaultAsync(note => note.Id == id, cancellationToken);

    public async Task<Page<Note>> PageAsync(string? search, int page, int pageSize, CancellationToken cancellationToken)
    {
        var notes = dbContext.Set<Note>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = LikePattern.Containing(TextNormalizer.Normalize(search));
            notes = notes.Where(note => EF.Functions.Like(note.NormalizedTitle, pattern, LikePattern.EscapeCharacter));
        }

        var total = await notes.CountAsync(cancellationToken);
        var items = await notes
            .OrderByDescending(note => note.UpdatedAt)
            .ThenBy(note => note.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new Page<Note>(items, total);
    }

    public void Add(Note note) => dbContext.Set<Note>().Add(note);

    public Task<int> DeleteAsync(Guid id, CancellationToken cancellationToken) =>
        dbContext.Set<Note>().Where(note => note.Id == id).ExecuteDeleteAsync(cancellationToken);
}
