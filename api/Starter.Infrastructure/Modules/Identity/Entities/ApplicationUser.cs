using Microsoft.AspNetCore.Identity;

namespace Starter.Infrastructure.Modules.Identity.Entities;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public const int EmailMaxLength = 256;
    public const int DisplayNameMaxLength = 200;
    public const int PasswordMaxLength = 256;

    public Guid TenantId { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public TenantRole Role { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
