namespace Nails.Application.Modules.Identity.Rules;

public static class BelarusPhone
{
    public const int MaxInputLength = 32;

    private const string CountryCode = "+375";
    private const string CountryDigits = "375";
    private const string DomesticPrefix = "80";
    private const int LocalDigits = 9;
    private const string Separators = " ()-+";

    public static string? Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Any(symbol => !char.IsAsciiDigit(symbol) && !Separators.Contains(symbol, StringComparison.Ordinal)))
        {
            return null;
        }

        var digits = new string([.. value.Where(char.IsAsciiDigit)]);

        var local = digits.Length switch
        {
            LocalDigits => digits,
            LocalDigits + 3 when digits.StartsWith(CountryDigits, StringComparison.Ordinal) => digits[CountryDigits.Length..],
            LocalDigits + 2 when digits.StartsWith(DomesticPrefix, StringComparison.Ordinal) => digits[DomesticPrefix.Length..],
            _ => null
        };

        return local is null ? null : CountryCode + local;
    }
}
