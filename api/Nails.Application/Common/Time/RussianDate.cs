using System.Globalization;

namespace Nails.Application.Common.Time;

public static class RussianDate
{
    private const char NonBreakingSpace = ' ';
    private static readonly CultureInfo Russian = CultureInfo.GetCultureInfo("ru-RU");

    public static string DayMonthTime(DateTimeOffset instant)
    {
        var local = instant.ToOffset(MinskTime.Offset);
        var month = Russian.DateTimeFormat.AbbreviatedMonthGenitiveNames[local.Month - 1].TrimEnd('.');
        var day = local.Day.ToString(CultureInfo.InvariantCulture);
        var time = local.ToString("HH:mm", CultureInfo.InvariantCulture);

        return string.Concat(day, NonBreakingSpace.ToString(), month, ", ", time);
    }
}
