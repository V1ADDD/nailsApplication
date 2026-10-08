using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class Master : IAuditable, IVersioned
{
    public const int NameMaxLength = 120;
    public const int UrlMaxLength = 500;
    public const int SpecialtyMaxLength = 60;
    public const int PlaceMaxLength = 60;
    public const int AddressMaxLength = 200;
    public const int AboutMaxLength = 2000;
    public const int PhoneMaxLength = 13;
    public const int EmailMaxLength = 256;
    public const int HandleMaxLength = 64;

    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid? OrganizationId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? PhotoUrl { get; set; }

    public string Specialty { get; set; } = string.Empty;

    public List<string> CategoryIds { get; set; } = [];

    public string City { get; set; } = string.Empty;

    public string District { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public double Lat { get; set; }

    public double Lng { get; set; }

    public int ExperienceYears { get; set; }

    public string About { get; set; } = string.Empty;

    public VerificationStatus VerificationStatus { get; set; }

    public bool ShowOnline { get; set; }

    public string Phone { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Telegram { get; set; }

    public string? Viber { get; set; }

    public string? Instagram { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }

    public long Version { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
