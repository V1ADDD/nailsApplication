using Microsoft.Net.Http.Headers;

namespace Nails.Api.Host.Middleware;

public sealed class SecurityHeadersMiddleware(RequestDelegate next)
{
    private const string ScalarPath = "/scalar";
    private const string OpenApiPath = "/openapi";
    private const string ReferrerPolicyHeader = "Referrer-Policy";
    private const string PermissionsPolicyHeader = "Permissions-Policy";
    private const string ContentSecurityPolicy = "default-src 'none'; frame-ancestors 'none'";
    private const string NoSniff = "nosniff";
    private const string ReferrerPolicy = "no-referrer";
    private const string PermissionsPolicy = "camera=(), microphone=(), geolocation=(), payment=()";
    private const string NoStore = "no-store";

    public Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path;
        var headers = context.Response.Headers;
        headers[HeaderNames.XContentTypeOptions] = NoSniff;
        headers[ReferrerPolicyHeader] = ReferrerPolicy;
        headers[PermissionsPolicyHeader] = PermissionsPolicy;

        if (!path.StartsWithSegments(ScalarPath, StringComparison.OrdinalIgnoreCase)
            && !path.StartsWithSegments(OpenApiPath, StringComparison.OrdinalIgnoreCase))
        {
            headers[HeaderNames.ContentSecurityPolicy] = ContentSecurityPolicy;
        }

        context.Response.OnStarting(() =>
        {
            if (!context.Response.Headers.ContainsKey(HeaderNames.CacheControl))
            {
                context.Response.Headers[HeaderNames.CacheControl] = NoStore;
            }

            return Task.CompletedTask;
        });

        return next(context);
    }
}
