using Microsoft.Extensions.Logging;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Events;

namespace Nails.Application.Modules.Masters.Services;

public sealed partial class BookingEvents(IEnumerable<IBookingChangedHandler> handlers, ILogger<BookingEvents> logger) : IBookingEvents
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
        }
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Booking change handler failed for {BookingId} ({Kind})")]
    private static partial void LogHandlerFailed(ILogger logger, Exception exception, Guid bookingId, BookingChangeKind kind);
}
