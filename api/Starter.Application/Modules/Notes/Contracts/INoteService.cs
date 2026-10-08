using Starter.Application.Common.Paging;
using Starter.Application.Modules.Notes.Requests;
using Starter.Application.Modules.Notes.Responses;

namespace Starter.Application.Modules.Notes.Contracts;

public interface INoteService
{
    Task<PagedResponse<NoteSummaryResponse>> ListAsync(ListNotesRequest request, CancellationToken cancellationToken);

    Task<NoteResponse> GetAsync(Guid id, CancellationToken cancellationToken);

    Task<NoteResponse> CreateAsync(CreateNoteRequest request, CancellationToken cancellationToken);

    Task<NoteResponse> UpdateAsync(Guid id, UpdateNoteRequest request, CancellationToken cancellationToken);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
