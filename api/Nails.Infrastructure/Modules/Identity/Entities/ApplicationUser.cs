using Microsoft.AspNetCore.Identity;

namespace Nails.Infrastructure.Modules.Identity.Entities;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public const int DisplayNameMaxLength = 200;

    public Guid TenantId { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public TenantRole Role { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? LastSeenAt { get; set; }

    public Guid? MasterId { get; set; }
}
