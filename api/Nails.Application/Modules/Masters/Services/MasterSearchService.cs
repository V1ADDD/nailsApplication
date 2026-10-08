using Microsoft.Extensions.Options;
using Nails.Application.Common.Exceptions;
using Nails.Application.Common.Time;
using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Options;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Models;

namespace Nails.Application.Modules.Masters.Services;

public sealed class MasterSearchService(
    IMasterSearchRepository masters,
    IFavoriteRepository favorites,
    IPresence presence,
    ICatalog catalog,
    ICurrentUser currentUser,
    TimeProvider clock,
    IOptions<MasterSearchOptions> options) : IMasterSearchService
{
    private const int RatingDecimals = 1;

    public async Task<MasterSearchResponse> SearchAsync(MasterSearchRequest request, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var now = clock.GetUtcNow();
        var origin = (Lat: request.Lat ?? settings.DefaultLatitude, Lng: request.Lng ?? settings.DefaultLongitude);
        var window = request.Window is { } kind ? WindowRange(kind, now) : ((DateTimeOffset, DateTimeOffset)?)null;
        var box = request.MaxDistanceKm is { } km ? Geo.BoxAround(origin.Lat, origin.Lng, km) : null;

        var candidates = await masters.FindCandidatesAsync(
            new CandidateQuery
            {
                Now = now,
                City = string.IsNullOrWhiteSpace(request.City) ? null : request.City.Trim(),
                Box = box is null ? null : (box.MinLat, box.MaxLat, box.MinLng, box.MaxLng),
                VerifiedOnly = request.Verified == true,
                FreeWindow = window,
                IncludeNextFreeSlot = request.Sort == SearchSort.NextSlot || window is not null
            },
            cancellationToken);

        var online = await OnlineUsersAsync(candidates, cancellationToken);
        var matched = Order(
                candidates
                    .Select(candidate => Rank(candidate, request, origin, online))
                    .OfType<RankedMaster>(),
                request.Sort)
            .ToList();

        var pageSize = Math.Min(request.PageSize ?? settings.DefaultPageSize, settings.MaxPageSize);
        var page = matched.Skip((request.Page - 1) * pageSize).Take(pageSize).ToList();
        var favoriteIds = await FavoriteIdsAsync(cancellationToken);

        return new MasterSearchResponse(
            matched.Count,
            matched.Count(master => master.Online),
            [.. page.Select(master => Card(master, favoriteIds))],
            [.. matched.Take(settings.PinLimit).Select(master => new MapPinResponse(
                master.Candidate.Id,
                master.Candidate.Lat,
                master.Candidate.Lng,
                ToResponse(master.Headline),
                master.Candidate.Specialty,
                master.Online))]);
    }

    public async Task<MasterCardResponse> CardAsync(Guid masterId, CardRequest request, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var candidates = await masters.FindCandidatesAsync(
            new CandidateQuery { Now = clock.GetUtcNow(), MasterIds = [masterId] },
            cancellationToken);
        var candidate = (candidates.Count > 0 ? candidates[0] : null) ?? throw new NotFoundException("Мастер не найден");
        var online = await OnlineUsersAsync(candidates, cancellationToken);
        var origin = (Lat: request.Lat ?? settings.DefaultLatitude, Lng: request.Lng ?? settings.DefaultLongitude);
        var ranked = Rank(candidate, new MasterSearchRequest(), origin, online)!;
        return Card(ranked, await FavoriteIdsAsync(cancellationToken));
    }

    private RankedMaster? Rank(
        MasterCandidate candidate,
        MasterSearchRequest request,
        (double Lat, double Lng) origin,
        IReadOnlySet<Guid> online)
    {
        var distance = Geo.DistanceKm(origin.Lat, origin.Lng, candidate.Lat, candidate.Lng);
        var rating = candidate.RatingAverage is { } average ? Math.Round(average, RatingDecimals, MidpointRounding.AwayFromZero) : (double?)null;
        var isOnline = candidate.ShowOnline && online.Contains(candidate.UserId);

        if ((request.MaxDistanceKm is { } km && distance > km)
            || (request.MinRating is { } minimum && (rating is null || rating < minimum))
            || (request.Online == true && !isOnline))
        {
            return null;
        }

        var services = candidate.Services.Where(service => FitsServiceFilter(service, request)).ToList();
        var match = MasterMatch.For(
            [.. services.Select(Matchable).OfType<MatchableService>()],
            string.Join(' ', candidate.Name, candidate.Specialty, candidate.District, candidate.City),
            request.Q);

        services = [.. services.Where(service =>
            match.SubcategoryIds.Contains(service.SubcategoryId)
            && Prices.InRange(PriceOf(service), request.PriceFrom, request.PriceTo))];

        if (match.Score == MasterMatch.None || services.Count == 0)
        {
            return null;
        }

        var headline = Prices.Headline([.. services.Select(service =>
            (PriceOf(service), catalog.FindSubcategory(service.SubcategoryId)?.Addon ?? false))]);

        return new RankedMaster(candidate, match.Score, services, services.Count < candidate.Services.Count, distance, isOnline, headline, rating);
    }

    private bool FitsServiceFilter(CandidateService service, MasterSearchRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.SubcategoryId))
        {
            return service.SubcategoryId == request.SubcategoryId;
        }

        return string.IsNullOrWhiteSpace(request.CategoryId)
            || catalog.FindSubcategory(service.SubcategoryId)?.CategoryId == request.CategoryId;
    }

    private MatchableService? Matchable(CandidateService service)
    {
        var sub = catalog.FindSubcategory(service.SubcategoryId);
        var category = sub is null ? null : catalog.FindCategory(sub.CategoryId);
        return sub is null || category is null
            ? null
            : new MatchableService(sub.Id, sub.Name, sub.Synonyms, category.Name, category.Synonyms);
    }

    private static IEnumerable<RankedMaster> Order(IEnumerable<RankedMaster> masters, SearchSort sort)
    {
        var ordered = masters.OrderByDescending(master => master.Score);

        ordered = sort switch
        {
            SearchSort.Rating => ordered
                .ThenByDescending(master => master.Rating ?? -1)
                .ThenByDescending(master => master.Candidate.ReviewsCount),
            SearchSort.Price => ordered
                .ThenBy(master => master.Headline is null)
                .ThenBy(master => master.Headline?.Value ?? 0),
            SearchSort.NextSlot => ordered
                .ThenBy(master => master.Candidate.NextFreeSlotAt is null)
                .ThenBy(master => master.Candidate.NextFreeSlotAt),
            SearchSort.Popular => ordered.ThenByDescending(master => master.Candidate.CompletedBookings),
            _ => ordered
        };

        return ordered.ThenBy(master => master.DistanceKm);
    }

    private MasterCardResponse Card(RankedMaster master, HashSet<Guid> favoriteIds)
    {
        var candidate = master.Candidate;
        var subcategories = master.Services.Select(service => service.SubcategoryId).Distinct(StringComparer.Ordinal).ToList();

        return new MasterCardResponse(
            candidate.Id,
            candidate.Name,
            candidate.PhotoUrl,
            candidate.Specialty,
            master.Rating,
            candidate.ReviewsCount,
            candidate.ExperienceYears,
            master.DistanceKm,
            master.Online,
            candidate.Verified,
            favoriteIds.Contains(candidate.Id),
            currentUser.UserId != Guid.Empty && candidate.UserId == currentUser.UserId,
            ToResponse(master.Headline),
            master.Narrowed,
            master.Narrowed && subcategories.Count == 1 ? subcategories[0] : null,
            [.. master.Services.Select(service => new CardServiceResponse(
                service.SubcategoryId,
                catalog.SubcategoryName(service.SubcategoryId),
                ToResponse(PriceOf(service))!,
                service.DurationMin))],
            candidate.NextFreeSlotAt);
    }

    private async Task<IReadOnlySet<Guid>> OnlineUsersAsync(IReadOnlyList<MasterCandidate> candidates, CancellationToken cancellationToken) =>
        await presence.OnlineUsersAsync(
            [.. candidates.Where(candidate => candidate.ShowOnline).Select(candidate => candidate.UserId)],
            cancellationToken);

    private async Task<HashSet<Guid>> FavoriteIdsAsync(CancellationToken cancellationToken) =>
        currentUser.UserId == Guid.Empty
            ? []
            : [.. await favorites.MasterIdsAsync(currentUser.UserId, cancellationToken)];

    private static (DateTimeOffset From, DateTimeOffset To) WindowRange(SearchWindow window, DateTimeOffset now)
    {
        var (from, to) = SearchWindows.Dates(window, MinskTime.Today(now));
        return (MinskTime.StartOf(from), MinskTime.StartOf(to.AddDays(1)));
    }

    private static Price PriceOf(CandidateService service) => new(service.PriceKind, service.PriceAmount);

    private static PriceResponse? ToResponse(Price? price) => price is null ? null : new PriceResponse(price.Kind, price.Amount);
}
