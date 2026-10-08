using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Starter.Application.Common.Exceptions;

namespace Starter.Api.Host.Extensions;

public static class ProblemResults
{
    public const string CodeMember = "code";
    public const string TraceIdMember = "traceId";

    private const string ProblemContentType = "application/problem+json";

    public static Task WriteProblemAsync(this HttpContext context, AppException exception) =>
        context.WriteProblemAsync(exception.StatusCode, exception.Code, exception.Title, exception.Errors);

    public static Task WriteProblemAsync(
        this HttpContext context,
        int status,
        string code,
        string title,
        IReadOnlyDictionary<string, string[]>? errors = null)
    {
        var problem = errors is { Count: > 0 }
            ? new ValidationProblemDetails(errors.ToDictionary(pair => pair.Key, pair => pair.Value)) { Title = title, Status = status }
            : new ProblemDetails { Title = title, Status = status };

        problem.Extensions[CodeMember] = code;
        problem.Extensions[TraceIdMember] = context.TraceIdentifier;

        context.Response.StatusCode = status;
        return context.Response.WriteAsJsonAsync(problem, problem.GetType(), options: null, contentType: ProblemContentType);
    }

    public static void Customize(ProblemDetailsContext context)
    {
        var problem = context.ProblemDetails;
        problem.Extensions.TryAdd(CodeMember, CodeFor(problem.Status));
        problem.Extensions.TryAdd(TraceIdMember, Activity.Current?.Id ?? context.HttpContext.TraceIdentifier);
    }

    private static string CodeFor(int? status) => status switch
    {
        StatusCodes.Status400BadRequest => ErrorCodes.InvalidRequest,
        StatusCodes.Status401Unauthorized => ErrorCodes.Unauthorized,
        StatusCodes.Status403Forbidden => ErrorCodes.Forbidden,
        StatusCodes.Status404NotFound => ErrorCodes.NotFound,
        StatusCodes.Status409Conflict => ErrorCodes.Conflict,
        StatusCodes.Status429TooManyRequests => ErrorCodes.RateLimited,
        _ => ErrorCodes.Unexpected
    };
}
