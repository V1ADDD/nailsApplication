using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Identity.Options;

public sealed class BootstrapOptions : IValidatableObject
{
    public const string SectionName = "Modules:Identity:Bootstrap";

    public bool Enabled { get; set; }

    public string TenantName { get; set; } = string.Empty;

    public string OwnerEmail { get; set; } = string.Empty;

    public string OwnerDisplayName { get; set; } = string.Empty;

    public string OwnerPassword { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!Enabled)
        {
            yield break;
        }

        if (string.IsNullOrWhiteSpace(TenantName) || string.IsNullOrWhiteSpace(OwnerDisplayName))
        {
            yield return new ValidationResult(
                $"{nameof(TenantName)} and {nameof(OwnerDisplayName)} are required when bootstrap is enabled.",
                [nameof(TenantName), nameof(OwnerDisplayName)]);
        }

        if (!new EmailAddressAttribute().IsValid(OwnerEmail))
        {
            yield return new ValidationResult($"{nameof(OwnerEmail)} must be an email address.", [nameof(OwnerEmail)]);
        }

        if (string.IsNullOrEmpty(OwnerPassword))
        {
            yield return new ValidationResult($"{nameof(OwnerPassword)} is required when bootstrap is enabled.", [nameof(OwnerPassword)]);
        }
    }
}
