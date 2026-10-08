using Microsoft.AspNetCore.Antiforgery;
using Nails.Api.Host.Extensions;
using Nails.Api.Host.Security;
using Nails.Application.Common.Exceptions;

namespace Nails.Api.Host.Middleware;

public sealed class AntiforgeryMiddleware(RequestDelegate next, IAntiforgery antiforgery)
{
    private const string ApiPath = "/" + ModuleRoutes.ApiPrefix;

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
            await context.WriteProblemAsync(StatusCodes.Status400BadRequest, ErrorCodes.Antiforgery, ProblemTitles.Antiforgery);
            return;
        }

        await next(context);
    }
}
