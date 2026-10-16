using Nails.Application.Modules.Masters.Contracts;

namespace Nails.Application.Modules.Masters.Responses;

public sealed record MyBookingResponse(
    BookingResponse Booking,
    bool Upcoming,
    bool CanReview,
    MyReview? MyReview,
    BookingMoveCard? Move);
