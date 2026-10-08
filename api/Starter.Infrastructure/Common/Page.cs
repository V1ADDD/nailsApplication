namespace Starter.Infrastructure.Common;

public sealed record Page<T>(IReadOnlyList<T> Items, int TotalCount);
