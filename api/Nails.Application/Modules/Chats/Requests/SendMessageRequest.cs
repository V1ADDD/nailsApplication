using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Requests;

public sealed class SendMessageRequest
{
    [StringLength(Message.TextMaxLength)]
    public string? Text { get; init; }

    [StringLength(Message.MediaUrlMaxLength)]
    public string? MediaUrl { get; init; }
}
