namespace Starter.Application.Common.Exceptions;

public abstract class AppException(string code, int statusCode, string title) : Exception(title)
{
    public string Code { get; } = code;

    public int StatusCode { get; } = statusCode;

    public string Title { get; } = title;

    public virtual IReadOnlyDictionary<string, string[]>? Errors => null;
}
