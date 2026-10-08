namespace Nails.Application.Common.Time;

public static class MinskTime
{
    public static readonly TimeSpan Offset = TimeSpan.FromHours(3);

    public static DateOnly Today(DateTimeOffset now) => DateOnly.FromDateTime(now.ToOffset(Offset).DateTime);

    public static DateTimeOffset StartOf(DateOnly date) => At(date, TimeOnly.MinValue);

    public static DateTimeOffset At(DateOnly date, TimeOnly time) => new DateTimeOffset(date.ToDateTime(time), Offset).ToUniversalTime();
}
