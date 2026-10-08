using Microsoft.AspNetCore.Http;

namespace Nails.Application.Common.Exceptions;

public sealed class InvalidRequestException(string code, string title, IReadOnlyDictionary<string, string[]>? errors = null)
    : AppException(code, StatusCodes.Status400BadRequest, title)
{
    public const string DefaultTitle = "Проверьте введённые данные.";

    public override IReadOnlyDictionary<string, string[]>? Errors { get; } = errors;

    public static InvalidRequestException ForField(string field, string message) =>
        new(ErrorCodes.InvalidRequest, DefaultTitle, new Dictionary<string, string[]>(StringComparer.Ordinal) { [field] = [message] });
}
