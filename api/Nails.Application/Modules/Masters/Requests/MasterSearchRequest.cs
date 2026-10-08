using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Requests;

public sealed class MasterSearchRequest
{
    private const int QueryMaxLength = 100;
    private const double MaxPrice = 100000;
    private const double MaxDistanceKmLimit = 1000;
    private const int MaxPageSize = 50;

    [MaxLength(QueryMaxLength)]
    [FromQuery(Name = "q")]
    public string? Q { get; init; }

    [MaxLength(MasterService.SubcategoryMaxLength)]
    [FromQuery(Name = "categoryId")]
    public string? CategoryId { get; init; }

    [MaxLength(MasterService.SubcategoryMaxLength)]
    [FromQuery(Name = "subcategoryId")]
    public string? SubcategoryId { get; init; }

    [Range(0, MaxPrice)]
    [FromQuery(Name = "priceFrom")]
    public decimal? PriceFrom { get; init; }

    [Range(0, MaxPrice)]
    [FromQuery(Name = "priceTo")]
    public decimal? PriceTo { get; init; }

    [Range(0.1, MaxDistanceKmLimit)]
    [FromQuery(Name = "maxDistanceKm")]
    public double? MaxDistanceKm { get; init; }

    [Range(1, 5)]
    [FromQuery(Name = "minRating")]
    public double? MinRating { get; init; }

    [FromQuery(Name = "online")]
    public bool? Online { get; init; }

    [FromQuery(Name = "verified")]
    public bool? Verified { get; init; }

    [FromQuery(Name = "window")]
    public SearchWindow? Window { get; init; }

    [MaxLength(Master.PlaceMaxLength)]
    [FromQuery(Name = "city")]
    public string? City { get; init; }

    [FromQuery(Name = "sort")]
    public SearchSort Sort { get; init; } = SearchSort.Distance;

    [Range(-90, 90)]
    [FromQuery(Name = "lat")]
    public double? Lat { get; init; }

    [Range(-180, 180)]
    [FromQuery(Name = "lng")]
    public double? Lng { get; init; }

    [Range(1, int.MaxValue)]
    [FromQuery(Name = "page")]
    public int Page { get; init; } = 1;

    [Range(0, MaxPageSize)]
    [FromQuery(Name = "pageSize")]
    public int? PageSize { get; init; }
}
