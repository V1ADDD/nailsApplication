using Nails.Application.Common.Exceptions;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Rules;

public static class ReviewWindow
{
    public static string? Check(BookingStatus status, DateTimeOffset end, DateTimeOffset now, int windowDays, bool hasReview)
    {
        if (status != BookingStatus.Completed)
        {
            return ErrorCodes.NotCompleted;
        }

        if (now > end.AddDays(windowDays))
        {
            return ErrorCodes.ReviewWindowClosed;
        }

        return hasReview ? ErrorCodes.ReviewExists : null;
    }

    public static bool CanWrite(BookingStatus status, DateTimeOffset end, DateTimeOffset now, int windowDays, bool hasReview) =>
        Check(status, end, now, windowDays, hasReview) is null;
}
