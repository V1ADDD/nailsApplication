using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Masters.Requests;

public sealed class MoveBookingRequest
{
    [Required(ErrorMessage = "Выберите время")]
    public Guid? SlotId { get; init; }
}
