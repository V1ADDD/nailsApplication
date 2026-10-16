using Microsoft.Extensions.Options;
using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Options;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Services;

public sealed class MyReviewService(
    IBookingRepository bookings,
    IReviewRepository reviews,
    IAccountDirectory accounts,
    ICatalog catalog,
    ICurrentUser currentUser,
    IOptions<ReviewOptions> options,
    TimeProvider clock) : IMyReviewService
{
    public async Task<ReviewResponse> WriteAsync(Guid bookingId, WriteReviewRequest request, CancellationToken cancellationToken)
    {
        var booking = await bookings.FindBookingAsync(bookingId, cancellationToken) ?? throw MastersErrors.BookingNotFound();
        var master = await bookings.FindMasterAsync(booking.MasterId, cancellationToken) ?? throw MastersErrors.BookingNotFound();
        var caller = currentUser.UserId;
        Party side;

        if (booking.ClientUserId is { } clientId && clientId == caller)
        {
            side = Party.Client;
        }
        else if (master.UserId == caller && booking.ClientUserId is not null)
        {
            side = Party.Master;
        }
        else
        {
            throw MastersErrors.NotBookingParty();
        }

        var end = booking.StartAt.AddMinutes(booking.DurationMin);
        var hasReview = await reviews.ExistsAsync(booking.Id, side, cancellationToken);

        if (ReviewWindow.Check(booking.Status, end, clock.GetUtcNow(), options.Value.WindowDays, hasReview) is { } error)
        {
            throw MastersErrors.For(error);
        }

        var review = new Review
        {
            Id = Guid.CreateVersion7(),
            BookingId = booking.Id,
            MasterId = booking.MasterId,
            ClientUserId = booking.ClientUserId!.Value,
            AuthorRole = side,
            SubcategoryId = booking.SubcategoryId,
            Rating = request.Rating!.Value,
            Text = request.Text?.Trim() ?? string.Empty
        };
        reviews.Add(review);

        if (!await reviews.SaveAsync(cancellationToken))
        {
            throw MastersErrors.ReviewExists();
        }

        var names = await accounts.NamesAsync([review.ClientUserId], cancellationToken);
        var author = side == Party.Client ? ReviewerName.From(names.GetValueOrDefault(review.ClientUserId)) : master.Name;

        return new ReviewResponse(
            review.Id,
            review.SubcategoryId,
            catalog.SubcategoryName(review.SubcategoryId),
            review.Rating,
            review.Text,
            review.CreatedAt,
            author);
    }

    public async Task<MyReviewsResponse> MineAsync(MyReviewsRequest request, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var pageSize = Math.Min(request.PageSize ?? settings.DefaultPageSize, settings.MaxPageSize);
        var caller = currentUser.UserId;
        var (written, about) = await reviews.CountsAsync(caller, cancellationToken);
        var page = await reviews.PageAsync(caller, request.About ? Party.Master : Party.Client, request.Page, pageSize, cancellationToken);

        return new MyReviewsResponse(
            written,
            about,
            [.. page.Items.Select(row => new MyReviewResponse(
                row.Id,
                row.MasterId,
                row.MasterName,
                row.MasterPhotoUrl,
                catalog.SubcategoryName(row.SubcategoryId),
                row.Rating,
                row.Text,
                row.CreatedAt))],
            request.Page,
            pageSize,
            page.TotalCount);
    }
}
