using System.ComponentModel.DataAnnotations;

namespace Starter.Infrastructure.Options;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    public bool MigrateOnStart { get; set; }

    [Range(0, 10)]
    public int MaxRetryCount { get; set; }
}
