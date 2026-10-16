using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace Nails.Application.Modules.Chats.Requests;

public sealed class MessagesPageRequest
{
    [FromQuery(Name = "before")]
    public Guid? Before { get; init; }

    [Range(1, 500)]
    [FromQuery(Name = "limit")]
    public int? Limit { get; init; }
}
