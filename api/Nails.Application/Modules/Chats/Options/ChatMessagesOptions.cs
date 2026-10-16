using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Chats.Options;

public sealed class ChatMessagesOptions
{
    public const string SectionName = "Modules:Chats:Messages";

    [Range(1, 500)]
    public int PageSize { get; set; }

    [Range(1, 500)]
    public int MaxPageSize { get; set; }
}
