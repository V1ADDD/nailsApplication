using Nails.Application.Common.Exceptions;

namespace Nails.Api.Host.Extensions;

public static class ProblemTitles
{
    public const string InvalidRequest = InvalidRequestException.DefaultTitle;
    public const string Unauthorized = "Войдите, чтобы продолжить.";
    public const string Forbidden = "Это действие вам недоступно.";
    public const string NotFound = "Такой страницы нет.";
    public const string MethodNotAllowed = "Это действие не поддерживается.";
    public const string Conflict = "Данные изменились. Обновите страницу и попробуйте снова.";
    public const string UnsupportedMediaType = "Формат запроса не поддерживается.";
    public const string RateLimited = "Слишком много запросов. Попробуйте через минуту.";
    public const string Antiforgery = "Страница устарела. Обновите её и попробуйте снова.";
    public const string Unexpected = "Что-то пошло не так. Попробуйте ещё раз.";
}
