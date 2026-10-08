using Starter.Application.Modules.Help.Responses;

namespace Starter.Application.Modules.Help.Contracts;

public interface IHelpService
{
    HelpContentResponse Content(string? language);
}
