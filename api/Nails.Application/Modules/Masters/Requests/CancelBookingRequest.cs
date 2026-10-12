using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Requests;

public sealed class CancelBookingRequest
{
    [Required(ErrorMessage = "Укажите причину отмены")]
    [StringLength(Booking.CancelReasonMaxLength)]
    public string Reason { get; init; } = string.Empty;

    public bool Mutual { get; init; }
}
