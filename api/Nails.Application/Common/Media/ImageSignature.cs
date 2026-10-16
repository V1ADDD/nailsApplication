namespace Nails.Application.Common.Media;

public static class ImageSignature
{
    public const int HeaderLength = 12;

    private static readonly byte[] Jpeg = [0xFF, 0xD8, 0xFF];
    private static readonly byte[] Png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    private static readonly byte[] Riff = "RIFF"u8.ToArray();
    private static readonly byte[] Webp = "WEBP"u8.ToArray();

    public static string? ContentTypeOf(ReadOnlySpan<byte> header)
    {
        if (header.StartsWith(Jpeg))
        {
            return "image/jpeg";
        }

        if (header.StartsWith(Png))
        {
            return "image/png";
        }

        return header.Length >= HeaderLength && header.StartsWith(Riff) && header[8..HeaderLength].SequenceEqual(Webp)
            ? "image/webp"
            : null;
    }

    public static string ExtensionOf(string contentType) => contentType switch
    {
        "image/jpeg" => "jpg",
        "image/png" => "png",
        _ => "webp"
    };
}
