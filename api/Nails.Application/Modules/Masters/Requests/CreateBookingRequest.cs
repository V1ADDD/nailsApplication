using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Requests;

public sealed class CreateBookingRequest
{
    [Required]
    public Guid MasterId { get; init; }

    [Required]
    public Guid SlotId { get; init; }

    [Required]
    [StringLength(MasterService.SubcategoryMaxLength)]
    public string SubcategoryId { get; init; } = string.Empty;
}
