using System.Buffers.Binary;
using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using Nails.Infrastructure.Modules.Help.Contracts;
using Nails.Infrastructure.Modules.Help.Models;
using Nails.Infrastructure.Modules.Help.Options;

namespace Nails.Infrastructure.Modules.Help.Repositories;

public sealed partial class HelpContentRepository(IOptions<HelpOptions> options, IOptions<HelpImageOptions> imageOptions)
    : IHelpContentRepository
{
    private const string ArticlesFolder = "articles";
    private const string ImagesFolder = "images";
    private const string SiteFile = "site.json";
    private const string CompanyFile = "company.json";
    private const string JsonPattern = "*.json";
    private const int PngHeaderLength = 24;
    private const int PngChunkTypeOffset = 12;
    private const int PngWidthOffset = 16;
    private const int PngHeightOffset = 20;
    private const int VersionBytes = 8;

    private static readonly byte[] PngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    private static readonly byte[] PngHeaderChunk = "IHDR"u8.ToArray();
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private readonly ConcurrentDictionary<string, object?> _cache = new(StringComparer.Ordinal);

    private string Root => Path.Combine(AppContext.BaseDirectory, options.Value.ContentPath);

    public IReadOnlyList<string> Languages() =>
        Cached(nameof(Languages), () => Directory.GetDirectories(Root)
            .Select(Path.GetFileName)
            .OfType<string>()
            .Order(StringComparer.Ordinal)
            .ToList());

    public HelpSite Site(string language) =>
        Cached($"{language}/{SiteFile}", () => Read<HelpSite>(Path.Combine(Root, language, SiteFile)));

    public HelpCompany Company() =>
        Cached(CompanyFile, () => Read<HelpCompany>(Path.Combine(Root, CompanyFile)));

    public IReadOnlyList<HelpDocument> Documents(string language) =>
        Cached($"{language}/{ArticlesFolder}", () => Directory
            .GetFiles(Path.Combine(Root, language, ArticlesFolder), JsonPattern)
            .Order(StringComparer.Ordinal)
            .Select(Read<HelpDocument>)
            .ToList());

    public HelpImageFile? FindImage(string language, string articleId, string fileName)
    {
        if (!Languages().Contains(language, StringComparer.Ordinal)
            || !SlugPattern().IsMatch(articleId)
            || !FileNamePattern().IsMatch(fileName)
            || !imageOptions.Value.ContentTypes.TryGetValue(Path.GetExtension(fileName), out var contentType))
        {
            return null;
        }

        var folder = Path.GetFullPath(Path.Combine(Root, language, ImagesFolder, articleId)) + Path.DirectorySeparatorChar;
        var fullPath = Path.GetFullPath(Path.Combine(folder, fileName));

        return fullPath.StartsWith(folder, StringComparison.Ordinal)
            ? Cached<HelpImageFile?>($"image:{fullPath}", () => ReadImage(fullPath, contentType))
            : null;
    }

    private static HelpImageFile? ReadImage(string fullPath, string contentType)
    {
        if (!File.Exists(fullPath))
        {
            return null;
        }

        using var stream = File.OpenRead(fullPath);
        Span<byte> header = stackalloc byte[PngHeaderLength];

        if (stream.ReadAtLeast(header, PngHeaderLength, throwOnEndOfStream: false) < PngHeaderLength
            || !header[..PngSignature.Length].SequenceEqual(PngSignature)
            || !header.Slice(PngChunkTypeOffset, PngHeaderChunk.Length).SequenceEqual(PngHeaderChunk))
        {
            return null;
        }

        var width = BinaryPrimitives.ReadInt32BigEndian(header[PngWidthOffset..]);
        var height = BinaryPrimitives.ReadInt32BigEndian(header[PngHeightOffset..]);

        if (width <= 0 || height <= 0)
        {
            return null;
        }

        stream.Position = 0;
        var version = Convert.ToHexStringLower(SHA256.HashData(stream).AsSpan(0, VersionBytes));

        return new HelpImageFile(fullPath, contentType, stream.Length, width, height, version);
    }

    [GeneratedRegex("^[a-z0-9]+(-[a-z0-9]+)*$")]
    private static partial Regex SlugPattern();

    [GeneratedRegex(@"^[a-z0-9]+(-[a-z0-9]+)*\.[a-z0-9]+$")]
    private static partial Regex FileNamePattern();

    private T Cached<T>(string key, Func<T> load) => (T)_cache.GetOrAdd(key, _ => load())!;

    private static T Read<T>(string path)
    {
        using var stream = File.OpenRead(path);
        return JsonSerializer.Deserialize<T>(stream, Json)
            ?? throw new InvalidOperationException($"Help content file {path} is empty.");
    }
}
