using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Identity.Entities;

public sealed class PhoneChangeCode : IAuditable
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Phone { get; set; } = string.Empty;

    public string CodeHash { get; set; } = string.Empty;

    public DateTimeOffset SentAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public int Attempts { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
