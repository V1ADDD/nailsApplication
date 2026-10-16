using Microsoft.Extensions.Options;
using Nails.Application.Common.Paging;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Options;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Models;

namespace Nails.Application.Modules.Masters.Services;

public sealed class MyBookingService(
    IMyBookingRepository repository,
    BookingResponses responses,
    ICurrentUser currentUser,
    IOptions<MyBookingsOptions> options,
    IOptions<ReviewOptions> reviewOptions,
    TimeProvider clock) : IMyBookingService
{
    public async Task<PagedResponse<MyBookingResponse>> MineAsync(MyBookingsRequest request, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var pageSize = Math.Min(request.PageSize ?? settings.DefaultPageSize, settings.MaxPageSize);
        var now = clock.GetUtcNow();
        var page = await repository.PageAsync(
            currentUser.UserId,
            request.Scope == MyBookingsScope.Upcoming,
            now,
            request.Page,
            pageSize,
            cancellationToken);
        var names = await responses.ClientNamesAsync(page.Items.Select(row => row.Booking), cancellationToken);

        return new PagedResponse<MyBookingResponse>(
            [.. page.Items.Select(row => ToResponse(row, names, now))],
            request.Page,
            pageSize,
            page.TotalCount);
    }

    public async Task<MyBookingResponse> FindAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var row = await repository.FindAsync(bookingId, cancellationToken) ?? throw MastersErrors.BookingNotFound();
        var caller = currentUser.UserId;

        if (row.Booking.ClientUserId != caller && row.MasterUserId != caller)
        {
            throw MastersErrors.NotBookingParty();
        }

        var names = await responses.ClientNamesAsync([row.Booking], cancellationToken);
        return ToResponse(row, names, clock.GetUtcNow());
    }

    private MyBookingResponse ToResponse(MyBookingRow row, IReadOnlyDictionary<Guid, string> names, DateTimeOffset now)
    {
        var booking = row.Booking;
        var review = row.ClientReview;
        var end = booking.StartAt.AddMinutes(booking.DurationMin);

        return new MyBookingResponse(
            responses.From(booking, row.MasterName, row.MasterPhotoUrl, names),
            MyBookingScope.IsUpcoming(booking.Status, booking.StartAt, now),
            ReviewWindow.CanWrite(booking.Status, end, now, reviewOptions.Value.WindowDays, review is not null),
            review is null ? null : new MyReview(review.Rating, review.Text, review.CreatedAt),
            BookingMoveCards.From(row.OpenMove));
    }
}
