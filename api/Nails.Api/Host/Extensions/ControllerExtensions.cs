using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Nails.Api.Host.Validation;
using Nails.Application.Common.Exceptions;
using Nails.Application.Common.Modules;

namespace Nails.Api.Host.Extensions;

public static class ControllerExtensions
{
    private const string JsonContentType = "application/json";

    public static IServiceCollection AddNailsControllers(this IServiceCollection services, ModuleRegistry registry)
    {
        services.AddProblemDetails(options => options.CustomizeProblemDetails = ProblemResults.Customize);
        services.AddAuthorization();

        services.AddControllers(options =>
            {
                options.Conventions.Add(new ModuleControllerConvention());
                options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider());
                options.ModelMetadataDetailsProviders.Add(new RussianValidationMetadataProvider());
                UseRussianBindingMessages(options.ModelBindingMessageProvider);
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
                var problem = new ValidationProblemDetails(Errors(context.ModelState))
                {
                    Title = ProblemTitles.InvalidRequest,
                    Status = StatusCodes.Status400BadRequest
                };
                problem.Extensions[ProblemResults.CodeMember] = ErrorCodes.InvalidRequest;
                problem.Extensions[ProblemResults.TraceIdMember] = context.HttpContext.TraceIdentifier;

                return new BadRequestObjectResult(problem);
            })
            .AddJsonOptions(options =>
            {
                options.AllowInputFormatterExceptionMessages = false;
                ConfigureJson(options.JsonSerializerOptions);
            });

        services.ConfigureHttpJsonOptions(options => ConfigureJson(options.SerializerOptions));

        return services;
    }

    private static void UseRussianBindingMessages(DefaultModelBindingMessageProvider messages)
    {
        messages.SetAttemptedValueIsInvalidAccessor((_, _) => ValidationMessages.InvalidValue);
        messages.SetNonPropertyAttemptedValueIsInvalidAccessor(_ => ValidationMessages.InvalidValue);
        messages.SetUnknownValueIsInvalidAccessor(_ => ValidationMessages.InvalidValue);
        messages.SetNonPropertyUnknownValueIsInvalidAccessor(() => ValidationMessages.InvalidValue);
        messages.SetValueIsInvalidAccessor(_ => ValidationMessages.InvalidValue);
        messages.SetValueMustBeANumberAccessor(_ => ValidationMessages.InvalidValue);
        messages.SetNonPropertyValueMustBeANumberAccessor(() => ValidationMessages.InvalidValue);
    }

    private static void ConfigureJson(JsonSerializerOptions options)
    {
        options.NumberHandling = JsonNumberHandling.Strict;
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    }

    private static Dictionary<string, string[]> Errors(ModelStateDictionary modelState) =>
        modelState
            .Where(entry => entry.Value is { Errors.Count: > 0 })
            .ToDictionary(
                entry => entry.Key,
                entry => entry.Value!.Errors
                    .Select(error => string.IsNullOrEmpty(error.ErrorMessage) ? ValidationMessages.InvalidValue : error.ErrorMessage)
                    .ToArray());
}
