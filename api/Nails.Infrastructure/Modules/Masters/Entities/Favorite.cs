namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class Favorite
{
    public Guid UserId { get; set; }

    public Guid MasterId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
