using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Application.Modules.Identity.Requests;

public sealed class RegisterRequest
{
    [Required]
    [MaxLength(ApplicationUser.DisplayNameMaxLength)]
    public required string DisplayName { get; init; }

    [Required]
    [EmailAddress]
    [MaxLength(ApplicationUser.EmailMaxLength)]
    public required string Email { get; init; }

    [Required]
    [MaxLength(ApplicationUser.PasswordMaxLength)]
    public required string Password { get; init; }
}
