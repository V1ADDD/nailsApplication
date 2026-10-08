using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Support.Entities;

public sealed class SupportTicket : IAuditable
{
    public const int TextMaxLength = 2000;
    public const int ContactMaxLength = 200;

    public Guid Id { get; set; }

    public string Text { get; set; } = string.Empty;

    public string? Contact { get; set; }

    public Guid? UserId { get; set; }

    public SupportTicketStatus Status { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
