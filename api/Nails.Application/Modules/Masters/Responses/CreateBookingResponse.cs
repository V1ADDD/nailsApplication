namespace Nails.Application.Modules.Masters.Responses;

public sealed record CreateBookingResponse(
    BookingResponse Booking,
    IReadOnlyList<BookingSummaryResponse> AutoCancelled,
    IReadOnlyList<BookingSummaryResponse> TooClose);
