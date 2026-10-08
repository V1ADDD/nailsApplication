namespace Nails.Application.Modules.Masters.Rules;

public static class BelarusPhone
{
    private const string CountryCode = "375";
    private const string DomesticPrefix = "80";
    private const string Separators = "+()- ";
    private const int NationalDigits = 9;
    private const int AreaCodeDigits = 2;

    private static readonly string[] AreaCodes = ["15", "16", "17", "21", "22", "23", "25", "29", "33", "44"];

    public static string? Normalize(string text)
    {
        if (!text.All(character => char.IsAsciiDigit(character) || Separators.Contains(character, StringComparison.Ordinal)))
        {
            return null;
        }

        var digits = new string([.. text.Where(char.IsAsciiDigit)]);
        var national = digits.StartsWith(CountryCode, StringComparison.Ordinal) ? digits[CountryCode.Length..]
            : digits.StartsWith(DomesticPrefix, StringComparison.Ordinal) ? digits[DomesticPrefix.Length..]
            : digits;

        return national.Length == NationalDigits && AreaCodes.Contains(national[..AreaCodeDigits], StringComparer.Ordinal)
            ? $"+{CountryCode}{national}"
            : null;
    }
}
