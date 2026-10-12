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
    public const string MasterNotFound = "master-not-found";
    public const string BookingNotFound = "booking-not-found";
    public const string SlotNotFound = "slot-not-found";
    public const string SlotTaken = "slot-taken";
    public const string SelfBooking = "self-booking";
    public const string ServiceNotOffered = "service-not-offered";
    public const string NotPending = "not-pending";
    public const string SameSideConfirm = "same-side-confirm";
    public const string CannotCancel = "cannot-cancel";
    public const string NotBookingParty = "not-booking-party";
}
