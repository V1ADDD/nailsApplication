using System.ComponentModel.DataAnnotations;

namespace Nails.Application.Modules.Masters.Options;

public sealed class NewMasterOptions
{
    public const string SectionName = "Modules:Masters:NewMaster";

    [MinLength(1)]
    public List<int> WorkDays { get; set; } = [];

    public TimeOnly TimeFrom { get; set; }

    public TimeOnly TimeTo { get; set; }

    [Range(5, 480)]
    public int SlotMinutes { get; set; }

    [Range(1, 20)]
    public int Capacity { get; set; }

    public bool AutoConfirmEnabled { get; set; }

    [Range(1, 1440)]
    public int AutoConfirmAfterMinutes { get; set; }
}
