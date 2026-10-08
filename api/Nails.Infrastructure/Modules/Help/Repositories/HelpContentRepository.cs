using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Nails.Infrastructure.Modules.Help.Contracts;
using Nails.Infrastructure.Modules.Help.Models;
using Nails.Infrastructure.Modules.Help.Options;

namespace Nails.Infrastructure.Modules.Help.Repositories;

public sealed class HelpContentRepository(IOptions<HelpOptions> options) : IHelpContentRepository
{
    private const string ArticlesFolder = "articles";
    private const string SiteFile = "site.json";
    private const string CompanyFile = "company.json";
    private const string JsonPattern = "*.json";

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private readonly ConcurrentDictionary<string, object> _cache = new(StringComparer.Ordinal);

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

    public IReadOnlyList<HelpArticleFile> Articles(string language) =>
        Cached($"{language}/{ArticlesFolder}", () => Directory
            .GetFiles(Path.Combine(Root, language, ArticlesFolder), JsonPattern)
            .Order(StringComparer.Ordinal)
            .Select(Read<HelpArticleFile>)
            .ToList());

    private T Cached<T>(string key, Func<T> load)
        where T : class =>
        (T)_cache.GetOrAdd(key, _ => load());

    private static T Read<T>(string path)
    {
        using var stream = File.OpenRead(path);
        return JsonSerializer.Deserialize<T>(stream, Json)
            ?? throw new InvalidOperationException($"Help content file {path} is empty.");
    }
}
