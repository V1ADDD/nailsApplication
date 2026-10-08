using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Application.Modules.Identity.Requests;

public sealed class SignInRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(ApplicationUser.EmailMaxLength)]
    public required string Email { get; init; }

    [Required]
    [MaxLength(ApplicationUser.PasswordMaxLength)]
    public required string Password { get; init; }

    public bool RememberMe { get; init; }
}
