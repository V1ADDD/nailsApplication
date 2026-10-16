using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Application.Modules.Identity.Requests;

public sealed class SetModeRequest
{
    [Required]
    public required UserMode Mode { get; init; }
}
