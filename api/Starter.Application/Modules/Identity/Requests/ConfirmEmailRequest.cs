using System.ComponentModel.DataAnnotations;

namespace Starter.Application.Modules.Identity.Requests;

public sealed class ConfirmEmailRequest
{
    public required Guid UserId { get; init; }

    [Required]
    [MaxLength(2048)]
    public required string Code { get; init; }
}
