using System.Reflection;
using Microsoft.AspNetCore.Mvc.Controllers;
using Nails.Application.Common.Modules;

namespace Nails.Api.Host.Extensions;

public sealed class ModuleControllerFeatureProvider(ModuleRegistry registry) : ControllerFeatureProvider
{
    protected override bool IsController(TypeInfo typeInfo)
    {
        if (!base.IsController(typeInfo))
        {
            return false;
        }

        return !ModuleNamespace.TryParse(typeInfo, out var module) || registry.IsEnabled(module);
    }
}
