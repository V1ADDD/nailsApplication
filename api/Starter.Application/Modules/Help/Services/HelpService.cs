using Microsoft.Extensions.Options;
using Starter.Application.Common.Modules;
using Starter.Application.Modules.Help.Contracts;
using Starter.Application.Modules.Help.Responses;
using Starter.Infrastructure.Modules.Help.Contracts;
using Starter.Infrastructure.Modules.Help.Options;

namespace Starter.Application.Modules.Help.Services;

public sealed class HelpService(IHelpContentRepository content, ModuleRegistry modules, IOptions<HelpOptions> options) : IHelpService
{
    private const string CoreModule = "core";

    public HelpContentResponse Content(string? language)
    {
        var languages = content.Languages();
        var chosen = language is not null && languages.Contains(language, StringComparer.Ordinal)
            ? language
            : options.Value.DefaultLanguage;

        var site = content.Site(chosen);
        var company = content.Company();
        var articles = content.Articles(chosen)
            .Where(file => file.Module == CoreModule || modules.IsEnabled(file.Module))
            .SelectMany(file => file.Articles.Select(article =>
                new HelpArticleResponse(article.Id, file.Module, article.Title, article.Summary, article.Body)))
            .ToList();

        return new HelpContentResponse(
            chosen,
            languages,
            new HelpSiteResponse(site.Title, site.Description),
            new HelpCompanyResponse(company.Name, company.Email, company.Website),
            articles);
    }
}
