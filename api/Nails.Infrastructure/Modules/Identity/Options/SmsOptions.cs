using System.ComponentModel.DataAnnotations;

namespace Nails.Infrastructure.Modules.Identity.Options;

public sealed class SmsOptions
{
    public const string SectionName = "Modules:Identity:Sms";

    [Required]
    public string RecipientDomain { get; set; } = string.Empty;
}
