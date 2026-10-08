using Starter.Api.Host.Extensions;
using Starter.Application.Common.Exceptions;

namespace Starter.Api.Host.Middleware;

public sealed partial class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    private const string UnexpectedTitle = "Something went wrong.";

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
            await context.WriteProblemAsync(StatusCodes.Status500InternalServerError, ErrorCodes.Unexpected, UnexpectedTitle);
        }
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Unhandled error on {Method} {Path}")]
    private static partial void LogUnhandled(ILogger logger, Exception exception, string method, PathString path);
}
