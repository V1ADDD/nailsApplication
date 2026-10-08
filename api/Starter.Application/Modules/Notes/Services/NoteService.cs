using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Starter.Application.Common.Exceptions;
using Starter.Application.Common.Paging;
using Starter.Application.Modules.Identity.Contracts;
using Starter.Application.Modules.Notes.Contracts;
using Starter.Application.Modules.Notes.Options;
using Starter.Application.Modules.Notes.Requests;
using Starter.Application.Modules.Notes.Responses;
using Starter.Infrastructure.Modules.Notes.Contracts;
using Starter.Infrastructure.Modules.Notes.Entities;
using Starter.Infrastructure.Persistence.Contracts;

namespace Starter.Application.Modules.Notes.Services;

public sealed class NoteService(
    INoteRepository notes,
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser,
    IOptions<NotesOptions> options) : INoteService
{
    public async Task<PagedResponse<NoteSummaryResponse>> ListAsync(ListNotesRequest request, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var page = request.Page ?? 1;
        var pageSize = Math.Min(request.PageSize ?? settings.DefaultPageSize, settings.MaxPageSize);
        var result = await notes.PageAsync(request.Search, page, pageSize, cancellationToken);

        return new PagedResponse<NoteSummaryResponse>(
            [.. result.Items.Select(note => new NoteSummaryResponse(note.Id, note.Title, note.UpdatedAt))],
            page,
            pageSize,
            result.TotalCount);
    }

    public async Task<NoteResponse> GetAsync(Guid id, CancellationToken cancellationToken) =>
        ToResponse(await notes.FindAsync(id, cancellationToken) ?? throw NotFound());

    public async Task<NoteResponse> CreateAsync(CreateNoteRequest request, CancellationToken cancellationToken)
    {
        var note = new Note { Id = Guid.CreateVersion7(), AuthorId = currentUser.UserId, Content = request.Content };
        note.Rename(request.Title);

        notes.Add(note);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ToResponse(note);
    }

    public async Task<NoteResponse> UpdateAsync(Guid id, UpdateNoteRequest request, CancellationToken cancellationToken)
    {
        var note = await notes.FindAsync(id, cancellationToken) ?? throw NotFound();

        if (note.Version != request.Version)
        {
            throw Changed();
        }

        note.Rename(request.Title);
        note.Content = request.Content;

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw Changed();
        }

        return ToResponse(note);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        if (await notes.DeleteAsync(id, cancellationToken) == 0)
        {
            throw NotFound();
        }
    }

    private static NoteResponse ToResponse(Note note) =>
        new(note.Id, note.Title, note.Content, note.AuthorId, note.CreatedAt, note.UpdatedAt, note.Version);

    private static NotFoundException NotFound() => new("This note does not exist.");

    private static ConflictException Changed() => new("Someone changed this note. Reload it and try again.");
}
