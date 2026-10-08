using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Starter.Application.Common.Modules;

public interface IAppModule
{
    string Name { get; }

    bool AlwaysOn { get; }

    void Register(IServiceCollection services, IConfiguration configuration);
}
