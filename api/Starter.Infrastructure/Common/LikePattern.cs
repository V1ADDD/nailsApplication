using System.Text;

namespace Starter.Infrastructure.Common;

public static class LikePattern
{
    public const string EscapeCharacter = "\\";

    private const char Escape = '\\';
    private const char Any = '%';

    public static string Containing(string text)
    {
        var pattern = new StringBuilder(text.Length + 2).Append(Any);

        foreach (var character in text)
        {
            if (character is '%' or '_' or Escape)
            {
                pattern.Append(Escape);
            }

            pattern.Append(character);
        }

        return pattern.Append(Any).ToString();
    }
}
