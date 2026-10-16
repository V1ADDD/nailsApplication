using Nails.Application.Modules.Chats.Rules;
using Nails.Application.Modules.Masters.Events;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Seed;

public static class ChatsDemoData
{
    private const string Me = "c-me";
    private const string MeMaster = "m-me";
    private const int Hour = 60;
    private const int Day = 24 * Hour;

    public static IReadOnlyList<DemoChat> Chats { get; } =
    [
        new("m-anna-serova", Me,
        [
            Client(22, "Здравствуйте! Хочу записаться на маникюр"),
            Master(17, "Привет! Конечно, когда вам удобно?"),
            Client(12, "Завтра с утра есть свободное время?"),
            Booking(8),
            Master(7, "Жду вас завтра в 10:00 ✨")
        ], ClientReadMinutesAgo: 15),
        new("m-marina-kovaleva", Me,
        [
            Client((26 * Hour) + 5, "Добрый день! Можно на ламинирование бровей?"),
            Booking(26 * Hour),
            new(MessageKind.System, null, 25 * Hour, ChatTexts.For(BookingChangeKind.Confirmed, true, null)),
            Master((24 * Hour) + 30, "Спасибо за доверие!")
        ]),
        new("m-yulia-pavlova", Me,
        [
            Client((3 * Day) + 40, "Здравствуйте, вы выезжаете на дом?"),
            Master((3 * Day) + 20, "Напишите ваш адрес, пожалуйста")
        ], ClientReadMinutesAgo: 4 * Day),
        new(MeMaster, "c-alina",
        [
            Client(2 * Day, "Анна, добрый вечер! Есть окошко на утро?"),
            Master((2 * Day) - 10, "Да, записала вас на 9:00 😊")
        ]),
        new(MeMaster, "c-viktoria",
        [
            Client(41, "Здравствуйте! Хочу покрытие, записалась на сегодня"),
            Booking(40)
        ], MasterReadMinutesAgo: Hour),
        new(MeMaster, "c-olga",
        [
            Client(5 * Hour, "Спасибо, до завтра!")
        ])
    ];

    private static DemoMessage Client(int minutesAgo, string text) => new(MessageKind.Text, ChatRole.Client, minutesAgo, text);

    private static DemoMessage Master(int minutesAgo, string text) => new(MessageKind.Text, ChatRole.Master, minutesAgo, text);

    private static DemoMessage Booking(int minutesAgo) => new(MessageKind.Booking, null, minutesAgo);
}
