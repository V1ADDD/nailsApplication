namespace Nails.Infrastructure.Common;

public static class TextNormalizer
{
    public static string Normalize(string text) => text.Trim().ToUpperInvariant();
}
