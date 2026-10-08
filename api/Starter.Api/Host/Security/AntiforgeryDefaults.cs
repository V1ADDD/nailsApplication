namespace Starter.Api.Host.Security;

public static class AntiforgeryDefaults
{
    public const string HeaderName = "X-XSRF-TOKEN";
    public const string CookieName = "starter.antiforgery";
    public const string RequestTokenCookieName = "XSRF-TOKEN";
}
