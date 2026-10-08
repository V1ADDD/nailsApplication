using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace Nails.Application.Modules.Masters.Requests;

public sealed class CardRequest
{
    [Range(-90, 90)]
    [FromQuery(Name = "lat")]
    public double? Lat { get; init; }

    [Range(-180, 180)]
    [FromQuery(Name = "lng")]
    public double? Lng { get; init; }
}
