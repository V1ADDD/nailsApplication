namespace Nails.Application.Common.Media;

public static class MediaUrls
{
    public const string Prefix = "/api/media/";

    public static string For(Guid id) => Prefix + id.ToString("D");

    public static Guid? IdOf(string url) =>
        url.StartsWith(Prefix, StringComparison.Ordinal) && Guid.TryParseExact(url[Prefix.Length..], "D", out var id) ? id : null;
}
