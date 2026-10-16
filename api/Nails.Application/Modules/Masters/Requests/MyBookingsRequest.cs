using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace Nails.Application.Modules.Masters.Requests;

public sealed class MyBookingsRequest
{
    [FromQuery(Name = "scope")]
    public MyBookingsScope Scope { get; init; }

    [Range(1, int.MaxValue)]
    [FromQuery(Name = "page")]
    public int Page { get; init; } = 1;

    [Range(1, 100)]
    [FromQuery(Name = "pageSize")]
    public int? PageSize { get; init; }
}
