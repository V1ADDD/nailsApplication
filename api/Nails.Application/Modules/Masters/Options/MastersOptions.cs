using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Masters.Options;

public sealed class MastersOptions
{
    public const string SectionName = "Modules:Masters";

    [Range(1, 1000)]
    public int DefaultPageSize { get; set; }

    [Range(1, 1000)]
    public int MaxPageSize { get; set; }

    [Range(1, 1000)]
    public int MaxOffers { get; set; }
}
