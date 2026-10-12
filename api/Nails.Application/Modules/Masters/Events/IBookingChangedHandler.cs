namespace Nails.Application.Modules.Masters.Events;

public interface IBookingChangedHandler
{
    Task HandleAsync(BookingChanged change, CancellationToken cancellationToken);
}
