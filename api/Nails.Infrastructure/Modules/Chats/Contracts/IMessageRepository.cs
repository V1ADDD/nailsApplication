using Nails.Infrastructure.Modules.Chats.Entities;
using Nails.Infrastructure.Modules.Chats.Models;

namespace Nails.Infrastructure.Modules.Chats.Contracts;

public interface IMessageRepository
{
    void Add(Message message);

    Task<Message?> FindAsync(Guid messageId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Message>> NewestAsync(
        Guid chatId,
        DateTimeOffset? after,
        Guid? before,
        int take,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<Guid>> BookingIdsAsync(Guid chatId, DateTimeOffset? after, CancellationToken cancellationToken);

    Task<IReadOnlyList<ReplyMessageRow>> ReplyMessagesAsync(Guid masterId, DateTimeOffset since, CancellationToken cancellationToken);
}
