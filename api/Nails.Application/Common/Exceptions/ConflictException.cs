using Microsoft.AspNetCore.Http;

namespace Nails.Application.Common.Exceptions;

public sealed class ConflictException(string code, string title)
    : AppException(code, StatusCodes.Status409Conflict, title)
{
    public ConflictException(string title)
        : this(ErrorCodes.Conflict, title)
    {
    }
}
