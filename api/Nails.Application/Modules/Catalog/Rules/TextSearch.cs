using System.Text;

namespace Nails.Application.Modules.Catalog.Rules;

public static class TextSearch
{
    private const int ShortWord = 3;
    private const int MediumWord = 6;

    public static string Normalize(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var builder = new StringBuilder(text.Length);
        var space = true;

        foreach (var raw in text.ToLowerInvariant())
        {
            var symbol = raw == 'ё' ? 'е' : raw;
            var kept = symbol is (>= 'a' and <= 'z') or (>= 'а' and <= 'я') || char.IsAsciiDigit(symbol);

            if (kept)
            {
                builder.Append(symbol);
                space = false;
            }
            else if (!space)
            {
                builder.Append(' ');
                space = true;
            }
        }

        return builder.ToString().TrimEnd();
    }

    public static int TypoBudget(string word) => word.Length <= ShortWord ? 0 : word.Length <= MediumWord ? 1 : 2;

    public static int EditDistance(string a, string b, int max)
    {
        if (Math.Abs(a.Length - b.Length) > max)
        {
            return max + 1;
        }

        var previous = new int[b.Length + 1];
        var current = new int[b.Length + 1];

        for (var j = 0; j <= b.Length; j++)
        {
            previous[j] = j;
        }

        for (var i = 1; i <= a.Length; i++)
        {
            current[0] = i;
            var rowMin = i;

            for (var j = 1; j <= b.Length; j++)
            {
                var cost = a[i - 1] == b[j - 1] ? 0 : 1;
                current[j] = Math.Min(Math.Min(previous[j] + 1, current[j - 1] + 1), previous[j - 1] + cost);
                rowMin = Math.Min(rowMin, current[j]);
            }

            if (rowMin > max)
            {
                return max + 1;
            }

            (previous, current) = (current, previous);
        }

        return previous[b.Length];
    }

    public static bool FuzzyIncludes(string text, string query)
    {
        var words = Normalize(text).Split(' ');
        var queryWords = Normalize(query).Split(' ', StringSplitOptions.RemoveEmptyEntries);

        return queryWords.All(queryWord => words.Any(word => WordMatches(word, queryWord)));
    }

    private static bool WordMatches(string word, string queryWord)
    {
        if (word.StartsWith(queryWord, StringComparison.Ordinal))
        {
            return true;
        }

        var budget = TypoBudget(queryWord);
        var prefix = word[..Math.Max(Math.Min(queryWord.Length, word.Length), Math.Min(word.Length, queryWord.Length + 1))];
        return EditDistance(queryWord, prefix, budget) <= budget;
    }
}
