using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Application.Modules.Identity.Responses;

public sealed record MeResponse(
    Guid Id,
    string Name,
    string? Phone,
    Guid? MasterId,
    UserMode Mode,
    int HeartbeatSeconds,
    string? Email,
    string? PhotoUrl,
    string? Telegram,
    string? Viber,
    PreferredContact PreferredContact,
    NotificationSettingsResponse Notifications);
