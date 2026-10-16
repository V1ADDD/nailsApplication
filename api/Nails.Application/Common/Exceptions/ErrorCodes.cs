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
    public const string MediaType = "media-type";
    public const string MediaTooLarge = "media-too-large";
    public const string MediaNotFound = "media-not-found";
    public const string MediaNotOwned = "media-not-owned";
    public const string NotAMaster = "not-a-master";
    public const string OtherRole = "other-role";
    public const string ChatNotFound = "chat-not-found";
    public const string SelfChat = "self-chat";
    public const string NotOwnClient = "not-own-client";
    public const string EmptyMessage = "empty-message";
    public const string ChatBlocked = "chat-blocked";
    public const string MessageNotFound = "message-not-found";
    public const string NotAuthor = "not-author";
    public const string MessageDeleted = "message-deleted";
    public const string AlreadyBlocked = "already-blocked";
    public const string NotBlocker = "not-blocker";
}
