namespace Nails.Api.Host.Security;

public static class AntiforgeryDefaults
{
    public const string HeaderName = "X-XSRF-TOKEN";
    public const string CookieName = "nails.antiforgery";
    public const string RequestTokenCookieName = "XSRF-TOKEN";
}
