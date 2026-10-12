using Nails.Application.Modules.Masters.Events;

namespace Nails.Application.Modules.Masters.Contracts;

public interface IBookingEvents
{
    Task PublishAsync(IReadOnlyList<BookingChanged> changes, CancellationToken cancellationToken);
}
