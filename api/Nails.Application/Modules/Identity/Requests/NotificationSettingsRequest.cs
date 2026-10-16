namespace Nails.Application.Modules.Identity.Requests;

public sealed class NotificationSettingsRequest
{
    public bool Push { get; init; }

    public bool Email { get; init; }

    public bool Site { get; init; }

    public bool Reminders { get; init; }
}
