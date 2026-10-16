using Nails.Application.Modules.Masters.Events;

namespace Nails.Application.Modules.Chats.Rules;

public static class ChatTexts
{
    public static string? For(BookingChangeKind kind, bool? byMaster, string? reason) => kind switch
    {
        BookingChangeKind.Confirmed => byMaster == true ? "Мастер подтвердил запись" : "Клиент подтвердил запись",
        BookingChangeKind.Cancelled => $"{(byMaster == true ? "Мастер" : "Клиент")} отменил запись. Причина: {reason}",
        BookingChangeKind.AutoConfirmed => "Запись подтверждена автоматически",
        BookingChangeKind.Expired => "Запись не подтвердили вовремя, окно освободилось. Её можно восстановить в чате.",
        BookingChangeKind.AutoCancelled => "Запись отменена автоматически: клиент записался на это же время к другому мастеру",
        _ => null
    };
}
