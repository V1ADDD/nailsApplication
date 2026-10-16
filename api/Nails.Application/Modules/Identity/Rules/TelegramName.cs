using System.Text.RegularExpressions;

namespace Nails.Application.Modules.Identity.Rules;

public static partial class TelegramName
{
    public const int MaxInputLength = 64;

    public static string? Normalize(string? value)
    {
        var name = (value ?? string.Empty).Replace(" ", string.Empty, StringComparison.Ordinal).TrimStart('@');

        return Pattern().IsMatch(name) ? "@" + name : null;
    }

    [GeneratedRegex("^[A-Za-z0-9_]{5,32}$")]
    private static partial Regex Pattern();
}
