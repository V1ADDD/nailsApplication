using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class Schedule : IAuditable
{
    public Guid MasterId { get; set; }

    public List<int> WorkDays { get; set; } = [];

    public TimeOnly TimeFrom { get; set; }

    public TimeOnly TimeTo { get; set; }

    public int SlotMinutes { get; set; }

    public List<ScheduleBreak> Breaks { get; set; } = [];

    public int Capacity { get; set; }

    public bool AutoConfirmEnabled { get; set; }

    public int AutoConfirmAfterMinutes { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
