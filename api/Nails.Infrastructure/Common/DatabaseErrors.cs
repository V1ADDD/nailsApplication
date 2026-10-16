using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Nails.Infrastructure.Common;

public static class DatabaseErrors
{
    public static bool IsUniqueViolation(Exception exception) =>
        exception is DbUpdateException { InnerException: PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } };
}
