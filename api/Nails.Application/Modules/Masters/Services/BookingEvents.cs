using Microsoft.Extensions.Logging;
using Nails.Application.Common.Realtime;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Events;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Application.Modules.Masters.Services;

public sealed partial class BookingEvents(
    IEnumerable<IBookingChangedHandler> handlers,
    IMasterDirectory directory,
    IRealtimePublisher realtime,
    ILogger<BookingEvents> logger) : IBookingEvents
{
    public async Task PublishAsync(IReadOnlyList<BookingChanged> changes, CancellationToken cancellationToken)
    {
        foreach (var change in changes)
        {
            foreach (var handler in handlers)
            {
                try
                {
                    await handler.HandleAsync(change, cancellationToken);
                }
                catch (Exception exception) when (exception is not OperationCanceledException)
                {
                    LogHandlerFailed(logger, exception, change.BookingId, change.Kind);
                }
            }

            await PushAsync(change, cancellationToken);
        }
    }

    private async Task PushAsync(BookingChanged change, CancellationToken cancellationToken)
    {
        if (await directory.BookingCardsAsync([change.BookingId], cancellationToken) is not [var card])
        {
            return;
        }

        var masters = await directory.MastersAsync([card.MasterId], cancellationToken);
        var userIds = new List<Guid>();

        if (masters.GetValueOrDefault(card.MasterId) is { } master)
        {
            userIds.Add(master.UserId);
        }

        if (card.ClientUserId is { } clientUserId)
        {
            userIds.Add(clientUserId);
        }

        await realtime.ToUsersAsync(userIds, RealtimeEvents.BookingChanged, new BookingChangedEvent(card), cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Booking change handler failed for {BookingId} ({Kind})")]
    private static partial void LogHandlerFailed(ILogger logger, Exception exception, Guid bookingId, BookingChangeKind kind);
}
