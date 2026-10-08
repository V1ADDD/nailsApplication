using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Requests;

public sealed class SearchMastersRequest
{
    [MaxLength(Offer.SlugMaxLength)]
    public string? Category { get; init; }

    [MaxLength(Offer.SlugMaxLength)]
    public string? Service { get; init; }

    [MaxLength(Offer.SlugMaxLength)]
    public string? City { get; init; }

    [Range(1, int.MaxValue)]
    public int? Page { get; init; }

    [Range(1, int.MaxValue)]
    public int? PageSize { get; init; }
}
