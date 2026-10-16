using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Requests;

public sealed class EditMessageRequest
{
    [StringLength(Message.TextMaxLength)]
    public string Text { get; init; } = string.Empty;
}
