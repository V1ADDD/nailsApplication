using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Starter.Application.Common.Exceptions;
using Starter.Application.Common.Modules;

namespace Starter.Api.Host.Extensions;

public static class ControllerExtensions
{
    private const string InvalidTitle = "The request is not valid.";
    private const string JsonContentType = "application/json";

    public static IServiceCollection AddStarterControllers(this IServiceCollection services, ModuleRegistry registry)
    {
        services.AddProblemDetails(options => options.CustomizeProblemDetails = ProblemResults.Customize);
        services.AddAuthorization();

        services.AddControllers(options =>
            {
                options.Conventions.Add(new ModuleControllerConvention());
                options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider());
                options.Filters.Add(new ProducesAttribute(JsonContentType));
                options.Filters.Add(new ConsumesAttribute(JsonContentType));
            })
            .ConfigureApplicationPartManager(manager =>
            {
                foreach (var provider in manager.FeatureProviders.OfType<ControllerFeatureProvider>().ToList())
                {
                    manager.FeatureProviders.Remove(provider);
                }

                manager.FeatureProviders.Add(new ModuleControllerFeatureProvider(registry));
            })
            .ConfigureApiBehaviorOptions(options => options.InvalidModelStateResponseFactory = context =>
            {
                var problem = new ValidationProblemDetails(context.ModelState)
                {
                    Title = InvalidTitle,
                    Status = StatusCodes.Status400BadRequest
                };
                problem.Extensions[ProblemResults.CodeMember] = ErrorCodes.InvalidRequest;
                problem.Extensions[ProblemResults.TraceIdMember] = context.HttpContext.TraceIdentifier;

                return new BadRequestObjectResult(problem);
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.Strict;
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
            });

        return services;
    }
}
