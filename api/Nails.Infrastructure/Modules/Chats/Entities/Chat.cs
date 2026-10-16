using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Chats.Entities;

public sealed class Chat : IAuditable, IVersioned
{
    public Guid Id { get; set; }

    public Guid MasterId { get; set; }

    public Guid ClientUserId { get; set; }

    public DateTimeOffset ClientReadAt { get; set; }

    public DateTimeOffset MasterReadAt { get; set; }

    public DateTimeOffset? ClientClearedAt { get; set; }

    public DateTimeOffset? MasterClearedAt { get; set; }

    public bool ClientHidden { get; set; }

    public bool MasterHidden { get; set; }

    public ChatRole? BlockedBy { get; set; }

    public DateTimeOffset? LastMessageAt { get; set; }

    public long Version { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
