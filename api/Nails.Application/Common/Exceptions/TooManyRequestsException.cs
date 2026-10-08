using Microsoft.AspNetCore.Http;

namespace Nails.Application.Common.Exceptions;

public sealed class TooManyRequestsException(string code, string title)
    : AppException(code, StatusCodes.Status429TooManyRequests, title);
