using Microsoft.AspNetCore.Mvc;
using Starter.Application.Common.Paging;
using Starter.Application.Modules.Notes.Contracts;
using Starter.Application.Modules.Notes.Requests;
using Starter.Application.Modules.Notes.Responses;

namespace Starter.Api.Modules.Notes.Controllers;

[ApiController]
[Route("")]
public sealed class NotesController(INoteService notes) : ControllerBase
{
    [HttpGet]
    public Task<PagedResponse<NoteSummaryResponse>> List([FromQuery] ListNotesRequest request, CancellationToken cancellationToken) =>
        notes.ListAsync(request, cancellationToken);

    [HttpGet("{id:guid}")]
    public Task<NoteResponse> Get(Guid id, CancellationToken cancellationToken) => notes.GetAsync(id, cancellationToken);

    [HttpPost]
    public async Task<ActionResult<NoteResponse>> Create(CreateNoteRequest request, CancellationToken cancellationToken)
    {
        var note = await notes.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = note.Id }, note);
    }

    [HttpPut("{id:guid}")]
    public Task<NoteResponse> Update(Guid id, UpdateNoteRequest request, CancellationToken cancellationToken) =>
        notes.UpdateAsync(id, request, cancellationToken);

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await notes.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
