using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Support.Entities;

namespace Nails.Application.Modules.Support.Requests;

public sealed class CreateSupportTicketRequest
{
    [Required(ErrorMessage = "Напишите, чем мы можем помочь")]
    [MaxLength(SupportTicket.TextMaxLength)]
    public required string Text { get; init; }

    [MaxLength(SupportTicket.ContactMaxLength)]
    public string? Contact { get; init; }
}
