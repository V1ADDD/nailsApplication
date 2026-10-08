using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Requests;

public class MasterProfileRequest
{
    private const int PhoneInputMaxLength = 32;

    [Required]
    [MaxLength(MasterProfile.DisplayNameMaxLength)]
    public required string DisplayName { get; init; }

    [MaxLength(MasterProfile.AboutMaxLength)]
    public string About { get; init; } = string.Empty;

    [Required]
    [MaxLength(PhoneInputMaxLength)]
    public required string Phone { get; init; }

    [Required]
    [MaxLength(Offer.SlugMaxLength)]
    public required string CityId { get; init; }

    [Required]
    [MaxLength(MasterProfile.AddressMaxLength)]
    public required string Address { get; init; }
}
