using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Nails.Application.Modules.Chats.Contracts;
using Nails.Application.Modules.Chats.Requests;
using Nails.Application.Modules.Chats.Responses;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Api.Modules.Chats.Controllers;

[ApiController]
[Route("")]
public sealed class MessagesController(IMessageService messages) : ControllerBase
{
    [HttpGet("{id:guid}/messages")]
    public Task<MessagesPageResponse> Page(
        Guid id,
        [FromQuery, BindRequired] ChatRole role,
        [FromQuery] MessagesPageRequest request,
        CancellationToken cancellationToken) =>
        messages.PageAsync(id, role, request, cancellationToken);

    [HttpPost("{id:guid}/messages")]
    [ProducesResponseType<MessageResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Send(
        Guid id,
        [FromQuery, BindRequired] ChatRole role,
        SendMessageRequest request,
        CancellationToken cancellationToken) =>
        StatusCode(StatusCodes.Status201Created, await messages.SendAsync(id, role, request, cancellationToken));

    [HttpPatch("messages/{messageId:guid}")]
    public Task<MessageResponse> Edit(Guid messageId, EditMessageRequest request, CancellationToken cancellationToken) =>
        messages.EditAsync(messageId, request, cancellationToken);

    [HttpDelete("messages/{messageId:guid}")]
    public Task<MessageResponse> Delete(Guid messageId, CancellationToken cancellationToken) =>
        messages.DeleteAsync(messageId, cancellationToken);
}
