using Nails.Application.Common.Exceptions;

namespace Nails.Application.Modules.Chats.Services;

public static class ChatsErrors
{
    public static ForbiddenException OtherRole() => new(ErrorCodes.OtherRole, "Этот чат доступен в другом режиме профиля");

    public static NotFoundException ChatNotFound() => new(ErrorCodes.ChatNotFound, "Чат не найден");

    public static NotFoundException MasterNotFound() => new(ErrorCodes.MasterNotFound, "Мастер не найден");

    public static InvalidRequestException StartTarget() =>
        new(ErrorCodes.InvalidRequest, "Укажите мастера или клиента");

    public static InvalidRequestException SelfChat() => new(ErrorCodes.SelfChat, "Нельзя написать самой себе");

    public static ForbiddenException NotOwnClient() => new(ErrorCodes.NotOwnClient, "Написать можно только своему клиенту");

    public static NotFoundException MessageNotFound() => new(ErrorCodes.MessageNotFound, "Сообщение не найдено");

    public static ConflictException AlreadyBlocked() => new(ErrorCodes.AlreadyBlocked, "Чат уже заблокирован");

    public static ForbiddenException NotBlocker() =>
        new(ErrorCodes.NotBlocker, "Разблокировать может только тот, кто заблокировал");

    public static AppException For(string code) => code switch
    {
        ErrorCodes.ChatBlocked => new ConflictException(ErrorCodes.ChatBlocked, "Чат заблокирован, писать нельзя"),
        ErrorCodes.EmptyMessage => new InvalidRequestException(ErrorCodes.EmptyMessage, "Пустое сообщение"),
        ErrorCodes.MessageDeleted => new ConflictException(ErrorCodes.MessageDeleted, "Сообщение уже удалено"),
        _ => new ForbiddenException(ErrorCodes.NotAuthor, "Можно менять только свои сообщения")
    };
}
