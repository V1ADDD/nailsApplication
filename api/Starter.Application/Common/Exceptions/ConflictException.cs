using Microsoft.AspNetCore.Http;

namespace Starter.Application.Common.Exceptions;

public sealed class ConflictException(string title)
    : AppException(ErrorCodes.Conflict, StatusCodes.Status409Conflict, title);
