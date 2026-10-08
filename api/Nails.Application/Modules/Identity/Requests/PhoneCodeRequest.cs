using System.ComponentModel.DataAnnotations;
using Nails.Application.Modules.Identity.Rules;

namespace Nails.Application.Modules.Identity.Requests;

public sealed class PhoneCodeRequest
{
    [Required]
    [MaxLength(BelarusPhone.MaxInputLength)]
    public required string Phone { get; init; }
}
