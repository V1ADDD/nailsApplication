using Microsoft.AspNetCore.Http;

namespace Starter.Application.Common.Exceptions;

public sealed class NotFoundException(string title)
    : AppException(ErrorCodes.NotFound, StatusCodes.Status404NotFound, title);
