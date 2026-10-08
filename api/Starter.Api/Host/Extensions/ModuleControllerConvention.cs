using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Authorization;

namespace Starter.Api.Host.Extensions;

public sealed class ModuleControllerConvention : IControllerModelConvention
{
    public void Apply(ControllerModel controller)
    {
        if (!ModuleNamespace.TryParse(controller.ControllerType, out var module))
        {
            throw new InvalidOperationException(
                $"Controller {controller.ControllerType.FullName} must live under {ModuleNamespace.Root}.<Module>.");
        }

        var prefix = new AttributeRouteModel(new RouteAttribute(ModuleRoutes.For(module)));

        foreach (var selector in controller.Selectors)
        {
            selector.AttributeRouteModel = selector.AttributeRouteModel is null
                ? prefix
                : AttributeRouteModel.CombineAttributeRouteModel(prefix, selector.AttributeRouteModel);
        }

        controller.Filters.Add(new AuthorizeFilter());
    }
}
