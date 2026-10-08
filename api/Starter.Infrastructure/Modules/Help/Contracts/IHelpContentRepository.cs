using Starter.Infrastructure.Modules.Help.Models;

namespace Starter.Infrastructure.Modules.Help.Contracts;

public interface IHelpContentRepository
{
    IReadOnlyList<string> Languages();

    HelpSite Site(string language);

    HelpCompany Company();

    IReadOnlyList<HelpArticleFile> Articles(string language);
}
