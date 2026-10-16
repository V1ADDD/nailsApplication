using Microsoft.AspNetCore.Identity;

namespace Nails.Infrastructure.Modules.Identity.Entities;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public const int DisplayNameMaxLength = 200;
    public const int PhotoUrlMaxLength = 500;
    public const int TelegramMaxLength = 33;
    public const int ViberMaxLength = 13;

    public Guid TenantId { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public TenantRole Role { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? LastSeenAt { get; set; }

    public Guid? MasterId { get; set; }

    public UserMode ActiveMode { get; set; }

    public string? PhotoUrl { get; set; }

    public string? Telegram { get; set; }

    public string? Viber { get; set; }

    public PreferredContact PreferredContact { get; set; }

    public bool NotifyPush { get; set; } = true;

    public bool NotifyEmail { get; set; } = true;

    public bool NotifySite { get; set; } = true;

    public bool NotifyReminders { get; set; } = true;
}
