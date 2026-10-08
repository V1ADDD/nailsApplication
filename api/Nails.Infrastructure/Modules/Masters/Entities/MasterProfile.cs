using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class MasterProfile : IAuditable, IVersioned
{
    public const int DisplayNameMaxLength = 100;
    public const int AboutMaxLength = 2000;
    public const int PhoneMaxLength = 13;
    public const int AddressMaxLength = 200;

    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public string About { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string CityId { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public long Version { get; set; }
}
