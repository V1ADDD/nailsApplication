using Nails.Application.Modules.Chats.Rules;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Events;
using Nails.Infrastructure.Modules.Chats.Contracts;
using Nails.Infrastructure.Modules.Chats.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Chats.Services;

public sealed class BookingChatHandler(
    IChatRepository chats,
    IMessageRepository messages,
    IMasterDirectory masters,
    IUnitOfWork unitOfWork,
    ChatEvents events,
    TimeProvider clock) : IBookingChangedHandler
{
    public async Task HandleAsync(BookingChanged change, CancellationToken cancellationToken)
    {
        if (change.ClientUserId is not { } clientUserId
            || (await masters.BookingCardsAsync([change.BookingId], cancellationToken)) is not [var card])
        {
            return;
        }

        var now = clock.GetUtcNow();
        var chat = change.Kind == BookingChangeKind.Created
            ? await chats.EnsurePairAsync(change.MasterId, clientUserId, now, cancellationToken)
            : await chats.FindPairAsync(change.MasterId, clientUserId, cancellationToken);

        if (chat is not null)
        {
            if (change.Kind == BookingChangeKind.Created)
            {
                var author = change.ByMaster == true ? ChatRole.Master : ChatRole.Client;
                await PostAsync(chat, MessageKind.Booking, author, null, change.BookingId, now, cancellationToken);
            }
            else if (ChatTexts.For(change.Kind, change.ByMaster, card.CancelReason) is { } text)
            {
                await PostAsync(chat, MessageKind.System, null, text, change.BookingId, now, cancellationToken);
            }
        }

        await events.BookingChangedAsync(chat?.Id, card, clientUserId, cancellationToken);
    }

    private async Task PostAsync(
        Chat chat,
        MessageKind kind,
        ChatRole? author,
        string? text,
        Guid bookingId,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var message = new Message
        {
            Id = Guid.CreateVersion7(),
            ChatId = chat.Id,
            Kind = kind,
            AuthorRole = author,
            Text = text,
            BookingId = bookingId,
            SentAt = now
        };
        messages.Add(message);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await chats.TouchAsync(chat.Id, now, cancellationToken);
        await events.MessageCreatedAsync(chat, message, cancellationToken);
    }
}
