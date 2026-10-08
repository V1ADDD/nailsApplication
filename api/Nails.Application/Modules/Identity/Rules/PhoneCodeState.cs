namespace Nails.Application.Modules.Identity.Rules;

public static class PhoneCodeState
{
    public static bool IsUsable(DateTimeOffset expiresAt, int attempts, int maxAttempts, DateTimeOffset now) =>
        now < expiresAt && attempts < maxAttempts;

    public static TimeSpan ResendWait(DateTimeOffset sentAt, TimeSpan interval, DateTimeOffset now)
    {
        var wait = sentAt + interval - now;
        return wait > TimeSpan.Zero ? wait : TimeSpan.Zero;
    }
}
