using Nails.Application.Modules.Identity.Responses;
using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Application.Modules.Identity.Services;

public static class MeResponses
{
    public static MeResponse From(ApplicationUser user, TimeSpan heartbeat) => new(
        user.Id,
        user.DisplayName,
        user.PhoneNumber,
        user.MasterId,
        user.MasterId is null ? UserMode.Client : user.ActiveMode,
        PhoneCodes.WholeSeconds(heartbeat),
        user.Email,
        user.PhotoUrl,
        user.Telegram,
        user.Viber,
        user.PreferredContact,
        Notifications(user));

    public static NotificationSettingsResponse Notifications(ApplicationUser user) =>
        new(user.NotifyPush, user.NotifyEmail, user.NotifySite, user.NotifyReminders);
}
