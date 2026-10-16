using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Nails.Application.Modules.Chats.Contracts;
using Nails.Application.Modules.Chats.Requests;
using Nails.Application.Modules.Chats.Responses;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Api.Modules.Chats.Controllers;

[ApiController]
[Route("")]
public sealed class ChatsController(IChatService chats) : ControllerBase
{
    [HttpPost("")]
    public Task<StartChatResponse> Start(StartChatRequest request, CancellationToken cancellationToken) =>
        chats.StartAsync(request, cancellationToken);

    [HttpGet("")]
    public Task<IReadOnlyList<ChatSummaryResponse>> List([FromQuery, BindRequired] ChatRole role, CancellationToken cancellationToken) =>
        chats.ListAsync(role, cancellationToken);

    [HttpGet("unread")]
    public Task<UnreadResponse> Unread([FromQuery, BindRequired] ChatRole role, CancellationToken cancellationToken) =>
        chats.UnreadAsync(role, cancellationToken);

    [HttpGet("{id:guid}")]
    public Task<ChatThreadResponse> Thread(Guid id, [FromQuery, BindRequired] ChatRole role, CancellationToken cancellationToken) =>
        chats.ThreadAsync(id, role, cancellationToken);

    [HttpPost("{id:guid}/read")]
    public Task<ReadResponse> Read(Guid id, [FromQuery, BindRequired] ChatRole role, CancellationToken cancellationToken) =>
        chats.ReadAsync(id, role, cancellationToken);

    [HttpPost("{id:guid}/block")]
    public Task<ChatResponse> Block(Guid id, [FromQuery, BindRequired] ChatRole role, CancellationToken cancellationToken) =>
        chats.BlockAsync(id, role, cancellationToken);

    [HttpDelete("{id:guid}/block")]
    public Task<ChatResponse> Unblock(Guid id, [FromQuery, BindRequired] ChatRole role, CancellationToken cancellationToken) =>
        chats.UnblockAsync(id, role, cancellationToken);

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Clear(Guid id, [FromQuery, BindRequired] ChatRole role, CancellationToken cancellationToken)
    {
        await chats.ClearAsync(id, role, cancellationToken);
        return NoContent();
    }
}
