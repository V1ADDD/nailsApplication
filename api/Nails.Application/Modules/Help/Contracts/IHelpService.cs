using Nails.Application.Modules.Help.Responses;

namespace Nails.Application.Modules.Help.Contracts;

public interface IHelpService
{
    HelpContentResponse Content(string? language);
}
