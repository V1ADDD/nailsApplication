using Microsoft.Extensions.Options;
using Nails.Application.Common.Paging;
using Nails.Application.Common.Time;
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

public sealed class MasterProfileService(
    IMasterProfileRepository profiles,
    IFavoriteRepository favorites,
    IPresence presence,
    IAccountDirectory accounts,
    ICatalog catalog,
    MasterFacts facts,
    ICurrentUser currentUser,
    TimeProvider clock,
    IOptions<MasterSearchOptions> searchOptions,
    IOptions<BookingOptions> bookingOptions,
    IOptions<ReviewOptions> reviewOptions) : IMasterProfileService
{
    public async Task<MasterProfileResponse> ProfileAsync(Guid masterId, CardRequest request, CancellationToken cancellationToken)
    {
        var master = await profiles.FindAsync(masterId, cancellationToken) ?? throw MastersErrors.MasterNotFound();
        var settings = searchOptions.Value;
        var signedIn = currentUser.UserId != Guid.Empty;
        var online = master.ShowOnline
            ? await presence.OnlineUsersAsync([master.UserId], cancellationToken)
            : new HashSet<Guid>();
        var isFavorite = signedIn && await favorites.ExistsAsync(currentUser.UserId, master.Id, cancellationToken);
        var prices = master.Services.Select(service => (service.SubcategoryId, Price: new Price(service.PriceKind, service.PriceAmount))).ToList();

        return new MasterProfileResponse(
            master.Id,
            master.Name,
            master.PhotoUrl,
            master.Specialty,
            master.CategoryIds,
            master.City,
            master.District,
            master.Address,
            master.Lat,
            master.Lng,
            Geo.DistanceKm(request.Lat ?? settings.DefaultLatitude, request.Lng ?? settings.DefaultLongitude, master.Lat, master.Lng),
            MasterFacts.Rating(master.RatingAverage),
            master.ReviewsCount,
            master.ExperienceYears,
            master.Verified,
            MasterFacts.IsOnline(master.ShowOnline, master.UserId, online),
            master.About,
            [.. master.Courses.Select(course => new CourseResponse(course.Title, course.School, course.Year))],
            new ContactsResponse(master.Phone, master.Email, master.Telegram, master.Viber, master.Instagram),
            [.. master.Services.Select((service, index) => new ProfileServiceResponse(
                service.Id,
                service.SubcategoryId,
                catalog.FindSubcategory(service.SubcategoryId)?.CategoryId ?? string.Empty,
                catalog.SubcategoryName(service.SubcategoryId),
                MasterFacts.ToResponse(prices[index].Price)!,
                service.DurationMin))],
            [.. master.Portfolio.Select(photo => new PortfolioPhotoResponse(photo.Id, photo.Url, photo.Hue, photo.Caption))],
            MasterFacts.ToResponse(facts.Headline(prices)),
            master.CompletedBookings,
            isFavorite,
            signedIn && master.UserId == currentUser.UserId);
    }

    public async Task<SlotsResponse> SlotsAsync(Guid masterId, CancellationToken cancellationToken)
    {
        await EnsureMasterAsync(masterId, cancellationToken);
        var days = bookingOptions.Value.SlotDays;
        var now = clock.GetUtcNow();
        var to = MinskTime.StartOf(MinskTime.Today(now).AddDays(days));
        var slots = await profiles.SlotsAsync(masterId, now, to, cancellationToken);
        var entries = Slots.OnePerStart(slots.Select(slot => new SlotView(slot.Id, slot.StartAt, slot.DurationMin, slot.Status)));

        return new SlotsResponse(
            days,
            [.. entries.Select(slot => new SlotEntryResponse(
                slot.StartAt,
                slot.DurationMin,
                Slots.StatusFor(slot.Status),
                slot.Status == SlotStatus.Free ? slot.Id : null))]);
    }

    public async Task<PagedResponse<ReviewResponse>> ReviewsAsync(
        Guid masterId,
        ReviewsRequest request,
        CancellationToken cancellationToken)
    {
        await EnsureMasterAsync(masterId, cancellationToken);
        var settings = reviewOptions.Value;
        var pageSize = Math.Min(request.PageSize ?? settings.DefaultPageSize, settings.MaxPageSize);
        var page = await profiles.ReviewsAsync(masterId, request.Page, pageSize, cancellationToken);
        var names = await accounts.NamesAsync([.. page.Items.Select(review => review.ClientUserId)], cancellationToken);

        return new PagedResponse<ReviewResponse>(
            [.. page.Items.Select(review => new ReviewResponse(
                review.Id,
                review.SubcategoryId,
                catalog.SubcategoryName(review.SubcategoryId),
                review.Rating,
                review.Text,
                review.CreatedAt,
                ReviewerName.From(names.GetValueOrDefault(review.ClientUserId))))],
            request.Page,
            pageSize,
            page.TotalCount);
    }

    private async Task EnsureMasterAsync(Guid masterId, CancellationToken cancellationToken)
    {
        if (!await profiles.ExistsAsync(masterId, cancellationToken))
        {
            throw MastersErrors.MasterNotFound();
        }
    }
}
