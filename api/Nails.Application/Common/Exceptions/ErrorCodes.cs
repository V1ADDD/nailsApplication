namespace Nails.Application.Common.Exceptions;

public static class ErrorCodes
{
    public const string Unexpected = "unexpected";
    public const string InvalidRequest = "invalid-request";
    public const string Unauthorized = "unauthorized";
    public const string Forbidden = "forbidden";
    public const string NotFound = "not-found";
    public const string Conflict = "conflict";
    public const string RateLimited = "rate-limited";
    public const string Antiforgery = "antiforgery";
    public const string SessionEnded = "session-ended";
    public const string PhoneInvalid = "phone-invalid";
    public const string CodeTooSoon = "code-too-soon";
    public const string CodeInvalid = "code-invalid";
    public const string CodeExpired = "code-expired";
}
