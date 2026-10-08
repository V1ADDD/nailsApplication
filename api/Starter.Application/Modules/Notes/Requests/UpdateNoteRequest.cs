using System.ComponentModel.DataAnnotations;
using Starter.Infrastructure.Modules.Notes.Entities;

namespace Starter.Application.Modules.Notes.Requests;

public sealed class UpdateNoteRequest
{
    [Required]
    [MaxLength(Note.TitleMaxLength)]
    public required string Title { get; init; }

    [MaxLength(Note.ContentMaxLength)]
    public string Content { get; init; } = string.Empty;

    public required long Version { get; init; }
}
