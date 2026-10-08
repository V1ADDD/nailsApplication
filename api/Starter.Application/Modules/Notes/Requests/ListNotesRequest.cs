using System.ComponentModel.DataAnnotations;
using Starter.Infrastructure.Modules.Notes.Entities;

namespace Starter.Application.Modules.Notes.Requests;

public sealed class ListNotesRequest
{
    [MaxLength(Note.TitleMaxLength)]
    public string? Search { get; init; }

    [Range(1, int.MaxValue)]
    public int? Page { get; init; }

    [Range(1, int.MaxValue)]
    public int? PageSize { get; init; }
}
