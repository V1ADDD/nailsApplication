using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Nails.Application.Common.Modules;

public interface IAppModule
{
    string Name { get; }

    bool AlwaysOn { get; }

    IReadOnlyList<string> DependsOn { get; }

    void Register(IServiceCollection services, IConfiguration configuration);
}
