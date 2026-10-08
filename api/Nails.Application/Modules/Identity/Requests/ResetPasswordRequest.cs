using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Application.Modules.Identity.Requests;

public sealed class ResetPasswordRequest
{
    public required Guid UserId { get; init; }

    [Required]
    [MaxLength(2048)]
    public required string Code { get; init; }

    [Required]
    [MaxLength(ApplicationUser.PasswordMaxLength)]
    public required string NewPassword { get; init; }
}
