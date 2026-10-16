using Nails.Application.Common.Time;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Events;

namespace Nails.Application.Modules.Chats.Rules;

public static class ChatTexts
{
    public static string? For(BookingChangeKind kind, bool? byMaster, BookingCard card) => kind switch
    {
        BookingChangeKind.Confirmed => Confirmed(byMaster),
        BookingChangeKind.Cancelled => $"{(byMaster == true ? "Мастер" : "Клиент")} отменил запись. Причина: {card.CancelReason}",
        BookingChangeKind.AutoConfirmed => "Запись подтверждена автоматически",
        BookingChangeKind.Expired => "Запись не подтвердили вовремя, окно освободилось. Её можно восстановить в чате.",
        BookingChangeKind.AutoCancelled => "Запись отменена автоматически: клиент записался на это же время к другому мастеру",
        BookingChangeKind.MoveRequested when card.Move is { } move => $"Клиент предлагает перенести запись на {RussianDate.DayMonthTime(move.Start)}",
        BookingChangeKind.MoveAccepted => $"Мастер принял перенос на {RussianDate.DayMonthTime(card.Start)}",
        BookingChangeKind.MoveDeclined => "Мастер отклонил перенос",
        BookingChangeKind.MoveWithdrawn => "Клиент отменил перенос",
        BookingChangeKind.MoveLapsed => "Запрос на перенос истёк",
        _ => null
    };

    public static string Confirmed(bool? byMaster) => byMaster == true ? "Мастер подтвердил запись" : "Клиент подтвердил запись";
}
