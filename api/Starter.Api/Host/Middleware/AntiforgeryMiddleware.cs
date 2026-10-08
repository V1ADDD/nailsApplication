using Microsoft.AspNetCore.Antiforgery;
using Starter.Api.Host.Extensions;
using Starter.Api.Host.Security;
using Starter.Application.Common.Exceptions;

namespace Starter.Api.Host.Middleware;

public sealed class AntiforgeryMiddleware(RequestDelegate next, IAntiforgery antiforgery)
{
    private const string ApiPath = "/" + ModuleRoutes.ApiPrefix;
    private const string RejectedTitle = "The page is out of date. Reload it and try again.";

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments(ApiPath, StringComparison.OrdinalIgnoreCase))
        {
            await next(context);
            return;
        }

        var method = context.Request.Method;

        if (HttpMethods.IsGet(method))
        {
            var tokens = antiforgery.GetAndStoreTokens(context);
            context.Response.Cookies.Append(
                AntiforgeryDefaults.RequestTokenCookieName,
                tokens.RequestToken ?? string.Empty,
                new CookieOptions { HttpOnly = false, SameSite = SameSiteMode.Strict, Path = "/" });
        }
        else if (!HttpMethods.IsHead(method) && !HttpMethods.IsOptions(method) && !await antiforgery.IsRequestValidAsync(context))
        {
            await context.WriteProblemAsync(StatusCodes.Status400BadRequest, ErrorCodes.Antiforgery, RejectedTitle);
            return;
        }

        await next(context);
    }
}
