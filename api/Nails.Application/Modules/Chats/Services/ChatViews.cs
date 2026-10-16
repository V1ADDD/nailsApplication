using Nails.Application.Modules.Chats.Responses;
using Nails.Application.Modules.Chats.Rules;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Services;

public sealed class ChatViews(IMasterDirectory masters, IAccountDirectory accounts)
{
    public const string DeletedAccountName = "Аккаунт удалён";

    public static MessageResponse ToResponse(Message message) => new(
        message.Id,
        message.Kind,
        message.AuthorRole,
        message.Text,
        message.MediaUrl,
        message.BookingId,
        message.SentAt,
        message.EditedAt,
        message.DeletedAt is not null);

    public async Task<IReadOnlyDictionary<Guid, CounterpartResponse>> CounterpartsAsync(
        ChatRole role,
        IReadOnlyCollection<Chat> chats,
        CancellationToken cancellationToken)
    {
        if (role == ChatRole.Client)
        {
            var summaries = await masters.MastersAsync([.. chats.Select(chat => chat.MasterId)], cancellationToken);

            return chats.ToDictionary(
                chat => chat.Id,
                chat => summaries.GetValueOrDefault(chat.MasterId) is { } master
                    ? new CounterpartResponse(master.Id, master.Name, master.PhotoUrl, true, master.Online, master.Specialty, master.Deleted)
                    : new CounterpartResponse(chat.MasterId, DeletedAccountName, null, true, false, null, true));
        }

        var clientIds = chats.Select(chat => chat.ClientUserId).ToList();
        var names = await accounts.NamesAsync(clientIds, cancellationToken);
        var masterId = chats.Select(chat => chat.MasterId).FirstOrDefault();
        var ownClients = await masters.ClientsWithBookingsAsync(masterId, clientIds, cancellationToken);
        var phones = await accounts.PhonesAsync([.. clientIds.Where(ownClients.Contains)], cancellationToken);

        return chats.ToDictionary(
            chat => chat.Id,
            chat => names.GetValueOrDefault(chat.ClientUserId) is { } name
                ? new CounterpartResponse(chat.ClientUserId, name, null, false, false, phones.GetValueOrDefault(chat.ClientUserId), false)
                : new CounterpartResponse(chat.ClientUserId, DeletedAccountName, null, false, false, null, true));
    }

    public async Task<IReadOnlyDictionary<Guid, string>> ServiceNamesAsync(
        IEnumerable<Message?> messages,
        CancellationToken cancellationToken)
    {
        var bookingIds = messages
            .Where(message => message is { Kind: MessageKind.Booking, BookingId: not null })
            .Select(message => message!.BookingId!.Value)
            .ToList();

        return bookingIds.Count == 0
            ? []
            : (await masters.BookingCardsAsync(bookingIds, cancellationToken)).ToDictionary(card => card.Id, card => card.ServiceName);
    }

    public async Task<string> PreviewAsync(Message message, CancellationToken cancellationToken)
    {
        var names = await ServiceNamesAsync([message], cancellationToken);
        return Preview(message, names);
    }

    public static string Preview(Message? message, IReadOnlyDictionary<Guid, string> serviceNames) =>
        ChatPreview.For(message, message?.BookingId is { } bookingId ? serviceNames.GetValueOrDefault(bookingId) : null);
}
