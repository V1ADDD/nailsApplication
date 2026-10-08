using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Infrastructure.Modules.Masters.Entities;

public sealed class Course : IAuditable
{
    public const int TextMaxLength = 200;

    public Guid Id { get; set; }

    public Guid MasterId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string School { get; set; } = string.Empty;

    public int Year { get; set; }

    public int SortOrder { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
