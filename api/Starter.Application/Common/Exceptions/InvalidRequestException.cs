using Microsoft.AspNetCore.Http;

namespace Starter.Application.Common.Exceptions;

public sealed class InvalidRequestException(string code, string title, IReadOnlyDictionary<string, string[]>? errors = null)
    : AppException(code, StatusCodes.Status400BadRequest, title)
{
    public override IReadOnlyDictionary<string, string[]>? Errors { get; } = errors;
}
