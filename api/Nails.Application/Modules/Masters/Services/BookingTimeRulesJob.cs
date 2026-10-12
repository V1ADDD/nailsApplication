using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Options;

namespace Nails.Application.Modules.Masters.Services;

public sealed partial class BookingTimeRulesJob(
    IServiceScopeFactory scopes,
    TimeProvider clock,
    IOptions<BookingTimeRulesOptions> options,
    ILogger<BookingTimeRulesJob> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(options.Value.Interval, clock);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                await scope.ServiceProvider.GetRequiredService<IBookingTimeRules>().RunAsync(clock.GetUtcNow(), stoppingToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                LogTickFailed(logger, exception);
            }
        }
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Booking time rules tick failed")]
    private static partial void LogTickFailed(ILogger logger, Exception exception);
}
