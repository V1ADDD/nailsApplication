using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Application.Modules.Identity.Requests;

public sealed class EmailRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(ApplicationUser.EmailMaxLength)]
    public required string Email { get; init; }
}
