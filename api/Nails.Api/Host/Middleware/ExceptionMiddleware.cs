using Nails.Api.Host.Extensions;
using Nails.Application.Common.Exceptions;

namespace Nails.Api.Host.Middleware;

public sealed partial class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
        }
        catch (AppException exception) when (!context.Response.HasStarted)
        {
            await context.WriteProblemAsync(exception);
        }
        catch (Exception exception) when (!context.Response.HasStarted)
        {
            LogUnhandled(logger, exception, context.Request.Method, context.Request.Path);
            await context.WriteProblemAsync(StatusCodes.Status500InternalServerError, ErrorCodes.Unexpected, ProblemTitles.Unexpected);
        }
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Unhandled error on {Method} {Path}")]
    private static partial void LogUnhandled(ILogger logger, Exception exception, string method, PathString path);
}
