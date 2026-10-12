namespace Nails.Application.Modules.Masters.Contracts;

public interface IBookingTimeRules
{
    Task RunAsync(DateTimeOffset now, CancellationToken cancellationToken);
}
