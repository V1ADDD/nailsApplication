using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Chats.Options;

public sealed class ReplyTimeOptions
{
    public const string SectionName = "Modules:Chats:ReplyTime";

    [Range(1, 365)]
    public int WindowDays { get; set; }

    [Range(1, 100)]
    public int MinPairs { get; set; }
}
