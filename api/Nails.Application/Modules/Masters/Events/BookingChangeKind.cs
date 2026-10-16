namespace Nails.Application.Modules.Masters.Events;

public enum BookingChangeKind
{
    Created,
    AutoCancelled,
    Confirmed,
    AutoConfirmed,
    Cancelled,
    Expired,
    Completed,
    MoveRequested,
    MoveAccepted,
    MoveDeclined,
    MoveWithdrawn,
    MoveLapsed
}
