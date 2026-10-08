using Microsoft.AspNetCore.Http;

namespace Nails.Application.Common.Exceptions;

public sealed class UnauthorizedException(string code, string title)
    : AppException(code, StatusCodes.Status401Unauthorized, title);
