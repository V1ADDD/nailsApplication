using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;

namespace Nails.Api.Host.Validation;

public sealed class RussianValidationMetadataProvider : IValidationMetadataProvider
{
    public void CreateValidationMetadata(ValidationMetadataProviderContext context)
    {
        foreach (var attribute in context.ValidationMetadata.ValidatorMetadata.OfType<ValidationAttribute>())
        {
            if (attribute.ErrorMessage is null && attribute.ErrorMessageResourceType is null)
            {
                attribute.ErrorMessage = ValidationMessages.For(attribute);
            }
        }
    }
}
