using System.ComponentModel.DataAnnotations;

namespace Starter.Application.Modules.Notes.Options;

public sealed class NotesOptions
{
    public const string SectionName = "Modules:Notes";

    [Range(1, 1000)]
    public int DefaultPageSize { get; set; }

    [Range(1, 1000)]
    public int MaxPageSize { get; set; }
}
