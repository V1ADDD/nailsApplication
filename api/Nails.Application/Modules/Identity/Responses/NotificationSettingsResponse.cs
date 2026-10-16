namespace Nails.Application.Modules.Identity.Responses;

public sealed record NotificationSettingsResponse(bool Push, bool Email, bool Site, bool Reminders);
