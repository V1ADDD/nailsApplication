using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Masters.Requests;

public sealed class ConflictsRequest
{
    [Required]
    public Guid SlotId { get; init; }
}
