using Nails.Application.Common.Exceptions;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public static class BookingTransitions
{
    public static string? Confirm(BookingState state, Party by)
    {
        if (state.Status != BookingStatus.Pending)
        {
            return ErrorCodes.NotPending;
        }

        return by == state.CreatedBy ? ErrorCodes.SameSideConfirm : null;
    }

    public static string? Cancel(BookingState state) =>
        state.Status is BookingStatus.Pending or BookingStatus.Confirmed ? null : ErrorCodes.CannotCancel;

    public static string? Move(BookingState state, DateTimeOffset now) =>
        state.Status is BookingStatus.Pending or BookingStatus.Confirmed && state.Start > now ? null : ErrorCodes.CannotMove;

    public static string? Expire(BookingState state) =>
        state.Status == BookingStatus.Pending ? null : ErrorCodes.NotPending;

    public static string? Complete(BookingState state, DateTimeOffset now) =>
        state.Status == BookingStatus.Confirmed && state.Start.AddMinutes(state.DurationMin) < now ? null : ErrorCodes.Conflict;

    public static Party ConfirmingSide(BookingState state) =>
        state.CreatedBy == Party.Client ? Party.Master : Party.Client;
}
