namespace Nails.Application.Common.Exceptions;

public static class AccessErrors
{
    public static ForbiddenException NotAMaster() => new(ErrorCodes.NotAMaster, "Сначала создайте профиль мастера");
}
