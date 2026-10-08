using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Nails.Application.Common.Exceptions;
using Nails.Application.Common.Modules;
using Nails.Application.Modules.Help.Contracts;
using Nails.Application.Modules.Help.Responses;
using Nails.Infrastructure.Modules.Help.Contracts;
using Nails.Infrastructure.Modules.Help.Models;
using Nails.Infrastructure.Modules.Help.Options;

namespace Nails.Application.Modules.Help.Services;

public sealed partial class HelpService(
    IHelpContentRepository content,
    ModuleRegistry modules,
    IOptions<HelpOptions> options,
    IOptions<HelpImageOptions> imageOptions,
    ILogger<HelpService> logger) : IHelpService
{
    private const string CoreModule = "core";
    private const char PathSeparator = '/';
    private const string ImagesFolder = "images";
    private const int ImagePathParts = 3;

    public HelpContentResponse Content(string? language, Func<HelpImageAddress, string> imageUrl)
    {
        var chosen = Resolve(language);
        var site = content.Site(chosen);
        var company = content.Company();
        var articleIds = new HashSet<string>(StringComparer.Ordinal);

        var sections = content.Documents(chosen)
            .Where(document => document.Module == CoreModule || modules.IsEnabled(document.Module))
            .SelectMany(document => document.Sections ?? [])
            .GroupBy(section => section.Id, StringComparer.Ordinal)
            .Select(group => group.OrderBy(section => section.Order).ToList())
            .OrderBy(group => group[0].Order)
            .Select(group => (
                Section: group[0],
                Articles: group
                    .SelectMany(section => section.Articles ?? [])
                    .OrderBy(article => article.Order)
                    .Where(article => Claim(articleIds, article.Id))
                    .ToList()))
            .Where(entry => entry.Articles.Count > 0)
            .ToList();

        return new HelpContentResponse(
            new HelpSiteResponse(site.Title, site.Description),
            new HelpCompanyResponse(company.Name, company.Email, company.Website),
            [.. sections.Select(entry => new HelpSectionResponse(
                entry.Section.Id,
                entry.Section.Title,
                [.. entry.Articles.Select(article => ToArticle(article, articleIds, chosen, imageUrl))]))]);
    }

    public HelpImageFile Image(string language, string articleId, string fileName)
    {
        var image = content.FindImage(language, articleId, fileName);

        return image is not null && image.Length <= imageOptions.Value.MaxBytes
            ? image
            : throw new NotFoundException("Такой картинки нет.");
    }

    private string Resolve(string? language)
    {
        var languages = content.Languages();
        return language is not null && languages.Contains(language, StringComparer.Ordinal)
            ? language
            : options.Value.DefaultLanguage;
    }

    private bool Claim(HashSet<string> articleIds, string articleId)
    {
        if (articleIds.Add(articleId))
        {
            return true;
        }

        LogDuplicateArticle(logger, articleId);
        return false;
    }

    private HelpArticleResponse ToArticle(
        HelpArticleDocument article,
        HashSet<string> articleIds,
        string language,
        Func<HelpImageAddress, string> imageUrl) =>
        new(
            article.Id,
            article.Title,
            Blank(article.Summary),
            article.Keywords ?? [],
            [.. (article.Blocks ?? [])
                .Select(block => ToBlock(article.Id, block, articleIds, language, imageUrl))
                .OfType<HelpBlockResponse>()]);

    private HelpBlockResponse? ToBlock(
        string articleId,
        HelpBlockDocument block,
        HashSet<string> articleIds,
        string language,
        Func<HelpImageAddress, string> imageUrl)
    {
        if (!Enum.TryParse<HelpBlockType>(block.Type, ignoreCase: true, out var type))
        {
            LogUnknownBlock(logger, articleId, block.Type);
            return null;
        }

        var text = Blank(block.Text);

        switch (type)
        {
            case HelpBlockType.Related:
                var related = (block.ArticleIds ?? []).Where(articleIds.Contains).ToList();
                return related.Count == 0 ? null : new HelpBlockResponse(type, text, null, null, related, null);
            case HelpBlockType.Note:
                var tone = Enum.TryParse<HelpNoteTone>(block.Tone, ignoreCase: true, out var parsed) ? parsed : HelpNoteTone.Info;
                return new HelpBlockResponse(type, text, tone, null, null, null);
            case HelpBlockType.Image:
                var image = ToImage(articleId, block, language, imageUrl);
                return image is null ? null : new HelpBlockResponse(type, null, null, null, null, image);
            default:
                return new HelpBlockResponse(type, text, null, block.Items is { Count: > 0 } ? block.Items : null, null, null);
        }
    }

    private HelpImageResponse? ToImage(
        string articleId,
        HelpBlockDocument block,
        string language,
        Func<HelpImageAddress, string> imageUrl)
    {
        var parts = (block.File ?? string.Empty).Split(PathSeparator);
        var alt = Blank(block.Alt);
        var file = parts.Length == ImagePathParts && parts[0] == ImagesFolder && parts[1] == articleId && alt is not null
            ? content.FindImage(language, articleId, parts[2])
            : null;

        if (file is null || alt is null || file.Length > imageOptions.Value.MaxBytes)
        {
            LogUnusableImage(logger, articleId, block.File);
            return null;
        }

        return new HelpImageResponse(
            imageUrl(new HelpImageAddress(language, articleId, parts[2], file.Version)),
            alt,
            Blank(block.Caption),
            file.Width,
            file.Height);
    }

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    [LoggerMessage(Level = LogLevel.Warning, Message = "Help article {ArticleId} is defined more than once; the first one is used.")]
    private static partial void LogDuplicateArticle(ILogger logger, string articleId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Help article {ArticleId} has a block of unknown type {Type}.")]
    private static partial void LogUnknownBlock(ILogger logger, string articleId, string type);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Help article {ArticleId} has an unusable image {File}.")]
    private static partial void LogUnusableImage(ILogger logger, string articleId, string? file);
}
