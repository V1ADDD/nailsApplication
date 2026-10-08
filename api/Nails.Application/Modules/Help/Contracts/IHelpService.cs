using Nails.Application.Modules.Help.Responses;
using Nails.Infrastructure.Modules.Help.Models;

namespace Nails.Application.Modules.Help.Contracts;

public interface IHelpService
{
    HelpContentResponse Content(string? language, Func<HelpImageAddress, string> imageUrl);

    HelpImageFile Image(string language, string articleId, string fileName);
}
