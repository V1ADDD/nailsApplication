using Microsoft.Extensions.Options;
using Nails.Application.Common.Exceptions;
using Nails.Application.Common.Paging;
using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Options;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Modules.Masters.Models;

namespace Nails.Application.Modules.Masters.Services;

public sealed class MasterSearchService(
    IMasterRepository masters,
    IOfferRepository offers,
    ICatalogService catalog,
    IOptions<MastersOptions> options) : IMasterSearchService
{
    public async Task<PagedResponse<MasterSummaryResponse>> SearchAsync(SearchMastersRequest request, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var page = request.Page ?? 1;
        var pageSize = Math.Min(request.PageSize ?? settings.DefaultPageSize, settings.MaxPageSize);
        var result = await masters.SearchAsync(new MasterSearch(request.Category, request.Service, request.City, page, pageSize), cancellationToken);
        var directory = await catalog.GetDirectoryAsync(cancellationToken);
        var offersByMaster = (await offers.ListAsync([.. result.Items.Select(profile => profile.Id)], cancellationToken))
            .ToLookup(offer => offer.MasterId);

        return new PagedResponse<MasterSummaryResponse>(
            [.. result.Items.Select(profile => Summary(profile, [.. offersByMaster[profile.Id]], request, directory))],
            page,
            pageSize,
            result.TotalCount);
    }

    public async Task<MasterResponse> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var profile = await masters.FindPublicAsync(id, cancellationToken) ?? throw new NotFoundException("Мастер не найден.");
        var directory = await catalog.GetDirectoryAsync(cancellationToken);

        return MasterResponses.Master(profile, await offers.ListAsync([profile.Id], cancellationToken), directory);
    }

    private static MasterSummaryResponse Summary(
        MasterProfile profile,
        IReadOnlyList<Offer> offers,
        SearchMastersRequest request,
        CatalogDirectory directory)
    {
        var matching = offers
            .Where(offer => MasterMatch.Offer(request.Category, request.Service, offer.CategoryId, offer.ServiceId))
            .Select(offer => new Price(offer.PriceKind, offer.Price))
            .ToList();
        var categoryIds = offers.Select(offer => offer.CategoryId).ToHashSet(StringComparer.Ordinal);

        return new MasterSummaryResponse(
            profile.Id,
            profile.DisplayName,
            profile.CityId,
            MasterResponses.CityName(profile.CityId, directory),
            [.. directory.Categories.Where(category => categoryIds.Contains(category.Id)).Select(category => category.Name)],
            MasterResponses.Price(HeadlinePrice.For(matching)),
            offers.Count);
    }
}
