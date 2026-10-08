using Microsoft.AspNetCore.Http;

namespace Nails.Application.Common.Exceptions;

public sealed class NotFoundException(string code, string title)
    : AppException(code, StatusCodes.Status404NotFound, title)
{
    public NotFoundException(string title)
        : this(ErrorCodes.NotFound, title)
    {
    }
}
