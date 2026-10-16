using Nails.Application.Modules.Chats.Requests;
using Nails.Application.Modules.Chats.Responses;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Contracts;

public interface IMessageService
{
    Task<MessagesPageResponse> PageAsync(Guid chatId, ChatRole role, MessagesPageRequest request, CancellationToken cancellationToken);

    Task<MessageResponse> SendAsync(Guid chatId, ChatRole role, SendMessageRequest request, CancellationToken cancellationToken);

    Task<MessageResponse> EditAsync(Guid messageId, EditMessageRequest request, CancellationToken cancellationToken);

    Task<MessageResponse> DeleteAsync(Guid messageId, CancellationToken cancellationToken);
}
