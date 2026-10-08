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
    public const string CredentialsRejected = "credentials-rejected";
    public const string EmailNotConfirmed = "email-not-confirmed";
    public const string LockedOut = "locked-out";
    public const string RegistrationClosed = "registration-closed";
    public const string LinkInvalid = "link-invalid";
    public const string SessionEnded = "session-ended";
}
