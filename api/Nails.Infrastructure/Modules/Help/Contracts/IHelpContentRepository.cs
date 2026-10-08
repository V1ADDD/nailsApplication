using Nails.Infrastructure.Modules.Help.Models;

namespace Nails.Infrastructure.Modules.Help.Contracts;

public interface IHelpContentRepository
{
    IReadOnlyList<string> Languages();

    HelpSite Site(string language);

    HelpCompany Company();

    IReadOnlyList<HelpDocument> Documents(string language);

    HelpImageFile? FindImage(string language, string articleId, string fileName);
}
