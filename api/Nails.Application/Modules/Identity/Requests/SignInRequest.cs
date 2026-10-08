using System.ComponentModel.DataAnnotations;
using Nails.Application.Modules.Identity.Rules;
using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Application.Modules.Identity.Requests;

public sealed class SignInRequest
{
    public const int NameMaxLength = 120;

    private const int CodeMaxLength = 8;

    [Required]
    [MaxLength(BelarusPhone.MaxInputLength)]
    public required string Phone { get; init; }

    [Required]
    [MaxLength(CodeMaxLength)]
    public required string Code { get; init; }

    [MaxLength(ApplicationUser.DisplayNameMaxLength)]
    public string? Name { get; init; }
}
