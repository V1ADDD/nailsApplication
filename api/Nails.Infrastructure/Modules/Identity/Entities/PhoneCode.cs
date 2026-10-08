using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Identity.Entities;

public sealed class PhoneCode : IAuditable
{
    public const int PhoneMaxLength = 13;
    public const int CodeHashMaxLength = 200;

    public Guid Id { get; set; }

    public string Phone { get; set; } = string.Empty;

    public string CodeHash { get; set; } = string.Empty;

    public DateTimeOffset SentAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public int Attempts { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
