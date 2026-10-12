namespace Nails.Application.Modules.Masters.Rules;

public sealed record TimeRange(DateTimeOffset Start, int DurationMin)
{
    public DateTimeOffset End => Start.AddMinutes(DurationMin);
}
