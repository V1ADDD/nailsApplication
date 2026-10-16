using System.Globalization;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;

namespace Nails.Application.Modules.Identity.Services;

public static class PhoneCodes
{
    private const int DecimalBase = 10;

    private static readonly PasswordHasher<object> Hasher = new();
    private static readonly object Owner = new();

    public static string Generate(int length)
    {
        var upper = (int)Math.Pow(DecimalBase, length);
        return RandomNumberGenerator.GetInt32(upper).ToString(new string('0', length), CultureInfo.InvariantCulture);
    }

    public static string Hash(string code) => Hasher.HashPassword(Owner, code);

    public static bool Matches(string hash, string? code) =>
        code is not null && Hasher.VerifyHashedPassword(Owner, hash, code.Trim()) != PasswordVerificationResult.Failed;

    public static int WholeSeconds(TimeSpan duration) => (int)Math.Ceiling(duration.TotalSeconds);
}
