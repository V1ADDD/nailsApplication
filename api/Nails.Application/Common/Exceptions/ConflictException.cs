using Microsoft.AspNetCore.Http;

namespace Nails.Application.Common.Exceptions;

public sealed class ConflictException(string title)
    : AppException(ErrorCodes.Conflict, StatusCodes.Status409Conflict, title);
