using System.Security.Cryptography;
using System.Text;

namespace Nails.Infrastructure.Persistence;

public static class DemoIds
{
    private const int GuidBytes = 16;
    private const int VersionByte = 6;
    private const int VariantByte = 8;
    private const byte VersionMask = 0x0F;
    private const byte CustomVersion = 0x80;
    private const byte VariantMask = 0x3F;
    private const byte RfcVariant = 0x80;
    private const string Namespace = "nails-demo:";
    private const string UserPrefix = "user:";

    public static Guid User(string slug) => For(UserPrefix + slug);

    public static Guid For(string slug)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(Namespace + slug)).AsSpan(0, GuidBytes).ToArray();
        bytes[VersionByte] = (byte)((bytes[VersionByte] & VersionMask) | CustomVersion);
        bytes[VariantByte] = (byte)((bytes[VariantByte] & VariantMask) | RfcVariant);
        return new Guid(bytes, bigEndian: true);
    }
}
