using System.ComponentModel.DataAnnotations;
using Starter.Infrastructure.Modules.Identity.Entities;

namespace Starter.Application.Modules.Identity.Requests;

public sealed class EmailRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(ApplicationUser.EmailMaxLength)]
    public required string Email { get; init; }
}
