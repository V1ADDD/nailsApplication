using Microsoft.EntityFrameworkCore;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Chats.Entities;
using Nails.Infrastructure.Persistence;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Chats.Seed;

public sealed class ChatsDemoSeeder(AppDbContext dbContext, IMasterDirectory masters, TimeProvider clock) : IDemoSeeder
{
    public int Order => 30;

    public Task ResetAsync(CancellationToken cancellationToken)
    {
        var chatIds = ChatIds();
        return dbContext.Set<Chat>().Where(chat => chatIds.Contains(chat.Id)).ExecuteDeleteAsync(cancellationToken);
    }

    public async Task SeedAsync(CancellationToken cancellationToken)
    {
        var chatIds = ChatIds();

        if (await dbContext.Set<Chat>().AnyAsync(chat => chatIds.Contains(chat.Id), cancellationToken))
        {
            return;
        }

        var now = clock.GetUtcNow();

        foreach (var demo in ChatsDemoData.Chats)
        {
            var masterId = DemoIds.For(demo.MasterSlug);
            var clientUserId = DemoIds.User(demo.ClientSlug);
            var bookings = await masters.BookingsOfPairAsync(masterId, clientUserId, cancellationToken);
            var chatId = ChatId(demo);
            var messages = demo.Messages
                .Select((message, index) => ToMessage(chatId, index, message, now, bookings))
                .OfType<Message>()
                .ToList();

            dbContext.Set<Chat>().Add(new Chat
            {
                Id = chatId,
                MasterId = masterId,
                ClientUserId = clientUserId,
                ClientReadAt = now.AddMinutes(-(demo.ClientReadMinutesAgo ?? 0)),
                MasterReadAt = now.AddMinutes(-(demo.MasterReadMinutesAgo ?? 0)),
                LastMessageAt = messages.Max(message => message.SentAt),
                CreatedAt = messages.Min(message => message.SentAt)
            });
            dbContext.Set<Message>().AddRange(messages);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static Message? ToMessage(Guid chatId, int index, DemoMessage demo, DateTimeOffset now, IReadOnlyList<PairBooking> bookings)
    {
        var sentAt = now.AddMinutes(-demo.MinutesAgo);
        var booking = demo.Kind == MessageKind.Text
            ? null
            : bookings.OrderBy(item => Math.Abs((item.CreatedAt - sentAt).Ticks)).FirstOrDefault();

        if (demo.Kind == MessageKind.Booking && booking is null)
        {
            return null;
        }

        return new Message
        {
            Id = DemoIds.For($"{chatId:N}-m{index}"),
            ChatId = chatId,
            Kind = demo.Kind,
            AuthorRole = demo.Kind == MessageKind.Booking ? booking!.CreatedByMaster ? ChatRole.Master : ChatRole.Client : demo.Author,
            Text = demo.Text,
            BookingId = booking?.BookingId,
            SentAt = sentAt
        };
    }

    private static List<Guid> ChatIds() => [.. ChatsDemoData.Chats.Select(ChatId)];

    private static Guid ChatId(DemoChat demo) => DemoIds.For($"chat-{demo.MasterSlug}-{demo.ClientSlug}");
}
