namespace Nails.Application.Modules.Masters.Rules;

public static class ReviewerName
{
    public const string Anonymous = "Клиент";

    public static string From(string? displayName)
    {
        var words = (displayName ?? string.Empty).Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);

        return words.Length switch
        {
            0 => Anonymous,
            1 => words[0],
            _ => $"{words[0]} {words[1][0]}."
        };
    }
}
