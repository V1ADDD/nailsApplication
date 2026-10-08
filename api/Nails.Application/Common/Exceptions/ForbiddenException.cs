using Microsoft.AspNetCore.Http;

namespace Nails.Application.Common.Exceptions;

public sealed class ForbiddenException(string code, string title)
    : AppException(code, StatusCodes.Status403Forbidden, title);
