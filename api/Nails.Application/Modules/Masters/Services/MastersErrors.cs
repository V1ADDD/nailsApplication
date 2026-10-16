using Nails.Application.Common.Exceptions;

namespace Nails.Application.Modules.Masters.Services;

public static class MastersErrors
{
    public static NotFoundException MasterNotFound() => new(ErrorCodes.MasterNotFound, "Мастер не найден");

    public static NotFoundException BookingNotFound() => new(ErrorCodes.BookingNotFound, "Запись не найдена");

    public static NotFoundException SlotNotFound() => new(ErrorCodes.SlotNotFound, "Окно не найдено");

    public static ConflictException SlotTaken() => new(ErrorCodes.SlotTaken, "Это окно уже занято, выберите другое время");

    public static ConflictException SelfBooking() => new(ErrorCodes.SelfBooking, "Нельзя записаться к самой себе");

    public static ConflictException ServiceNotOffered() => new(ErrorCodes.ServiceNotOffered, "Мастер не оказывает эту услугу");

    public static ConflictException NotPending() => new(ErrorCodes.NotPending, "Запись уже не ожидает подтверждения");

    public static ConflictException SameSideConfirm() => new(ErrorCodes.SameSideConfirm, "Запись подтверждает другая сторона");

    public static ConflictException CannotCancel() => new(ErrorCodes.CannotCancel, "Эту запись уже нельзя отменить");

    public static ForbiddenException NotBookingParty() => new(ErrorCodes.NotBookingParty, "Это не ваша запись");

    public static ConflictException CannotMove() => new(ErrorCodes.CannotMove, "Эту запись уже нельзя перенести");

    public static ConflictException MoveExists() => new(ErrorCodes.MoveExists, "Перенос уже ждёт ответа мастера");

    public static ConflictException MoveNotOpen() => new(ErrorCodes.MoveNotOpen, "Запрос на перенос уже неактуален");

    public static ConflictException MoveOverlaps() => new(ErrorCodes.MoveOverlaps, "В это время у вас уже есть другая запись");

    public static ConflictException NotCompleted() => new(ErrorCodes.NotCompleted, "Отзыв можно оставить после завершённого визита");

    public static ConflictException ReviewWindowClosed() => new(ErrorCodes.ReviewWindowClosed, "Срок для отзыва истёк");

    public static ConflictException ReviewExists() => new(ErrorCodes.ReviewExists, "Вы уже оставили отзыв об этом визите");

    public static ConflictException MasterExists() => new(ErrorCodes.MasterExists, "У вас уже есть профиль мастера");

    public static AppException For(string code) => code switch
    {
        ErrorCodes.NotPending => NotPending(),
        ErrorCodes.SameSideConfirm => SameSideConfirm(),
        ErrorCodes.CannotCancel => CannotCancel(),
        ErrorCodes.CannotMove => CannotMove(),
        ErrorCodes.NotCompleted => NotCompleted(),
        ErrorCodes.ReviewWindowClosed => ReviewWindowClosed(),
        ErrorCodes.ReviewExists => ReviewExists(),
        _ => throw new ArgumentOutOfRangeException(nameof(code), code, null)
    };
}
