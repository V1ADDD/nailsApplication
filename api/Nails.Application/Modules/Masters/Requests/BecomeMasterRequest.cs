using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Requests;

public sealed class BecomeMasterRequest
{
    private const string CategoryMessage = "Выберите направление";
    private const string CityMessage = "Выберите город";
    private const string AddressMessage = "Укажите адрес";

    [Required(ErrorMessage = CategoryMessage)]
    [StringLength(MasterService.SubcategoryMaxLength, ErrorMessage = CategoryMessage)]
    public string? CategoryId { get; init; }

    [Required(ErrorMessage = CityMessage)]
    [StringLength(Master.PlaceMaxLength, ErrorMessage = CityMessage)]
    public string? City { get; init; }

    [Required(ErrorMessage = AddressMessage)]
    [StringLength(Master.AddressMaxLength, ErrorMessage = AddressMessage)]
    public string? Address { get; init; }
}
