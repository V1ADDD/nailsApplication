using Nails.Application.Modules.Chats.Requests;
using Nails.Application.Modules.Chats.Responses;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Contracts;

public interface IChatService
{
    Task<StartChatResponse> StartAsync(StartChatRequest request, CancellationToken cancellationToken);

    Task<IReadOnlyList<ChatSummaryResponse>> ListAsync(ChatRole role, CancellationToken cancellationToken);

    Task<UnreadResponse> UnreadAsync(ChatRole role, CancellationToken cancellationToken);

    Task<ChatThreadResponse> ThreadAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken);

    Task<ReadResponse> ReadAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken);

    Task<ChatResponse> BlockAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken);

    Task<ChatResponse> UnblockAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken);

    Task ClearAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken);
}
