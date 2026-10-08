namespace Nails.Application.Modules.Masters.Rules;

public static class SearchWindows
{
    public static (DateOnly From, DateOnly To) Dates(SearchWindow window, DateOnly today) => window switch
    {
        SearchWindow.Today => (today, today),
        SearchWindow.Tomorrow => (today.AddDays(1), today.AddDays(1)),
        _ => Weekend(today)
    };

    private static (DateOnly From, DateOnly To) Weekend(DateOnly today)
    {
        if (today.DayOfWeek == DayOfWeek.Sunday)
        {
            return (today, today);
        }

        var saturday = today.AddDays(((int)DayOfWeek.Saturday - (int)today.DayOfWeek + 7) % 7);
        return (saturday, saturday.AddDays(1));
    }
}
