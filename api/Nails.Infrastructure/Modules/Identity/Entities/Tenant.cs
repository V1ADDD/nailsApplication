using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Identity.Entities;

public sealed class Tenant : IAuditable
{
    public const int NameMaxLength = 200;

    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
