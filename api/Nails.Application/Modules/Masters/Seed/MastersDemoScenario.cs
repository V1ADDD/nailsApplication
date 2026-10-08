using Nails.Application.Common.Time;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Seed;

public static class MastersDemoScenario
{
    public const string Me = "c-me";
    public const string MeMaster = "m-me";

    private const int MinutesPerHour = 60;
    private const int SoonStepMinutes = 30;

    public static IReadOnlyList<string> Clients { get; } = ["c-alina", "c-viktoria", "c-olga", "c-darya", "c-elena", "c-maria"];

    public static IReadOnlyList<string> Favorites { get; } = ["m-anna-serova", "m-marina-kovaleva", "m-yulia-pavlova", "m-oksana-lebed"];

    public static IReadOnlyList<(int Rating, string Text)> ReviewTexts { get; } =
    [
        (5, "Очень аккуратно и быстро, покрытие держится уже третью неделю."),
        (5, "Лучший мастер, к которому я ходила! Уютно и чисто."),
        (4, "Хорошо, но пришлось немного подождать."),
        (5, "Сделали именно то, что я хотела, спасибо!"),
        (3, "В целом нормально, но форма не совсем та.")
    ];

    public static IReadOnlyList<DemoBooking> Bookings(DateTimeOffset now)
    {
        var today = MinskTime.Today(now);
        DateTimeOffset At(int day, int hour, int minute) => MinskTime.At(today.AddDays(day), new TimeOnly(hour, minute));

        var bookings = new List<DemoBooking>
        {
            new("m-anna-serova", Me, "manicure-combined", At(1, 10, 0), BookingStatus.Pending, Party.Master, 8),
            new("m-marina-kovaleva", Me, "brows-lamination", At(4, 14, 0), BookingStatus.Confirmed, CreatedMinutesAgo: 26 * MinutesPerHour),
            new("m-anna-serova", Me, "manicure-gel", At(-50, 11, 30), BookingStatus.Completed),
            new("m-oksana-lebed", Me, "lashes-classic", At(-75, 16, 0), BookingStatus.Completed),
            new("m-yulia-pavlova", Me, "cosmetology-cleansing", At(-20, 12, 0), BookingStatus.Cancelled, CancelReason: "Заболела, перенесу позже", CancelMutual: true),
            new(MeMaster, "c-alina", "manicure-hardware", Soon(now, 1), BookingStatus.Confirmed),
            new(MeMaster, "c-viktoria", "manicure-gel", Soon(now, 2.5), BookingStatus.Pending, CreatedMinutesAgo: 40),
            new(MeMaster, null, "manicure-gel", Soon(now, 4), BookingStatus.Confirmed, Party.Master, Source: BookingSource.External, ExternalClientName: "Ирина (Instagram)", Note: "Постоянная клиентка, любит нюд. Оплата картой."),
            new(MeMaster, "c-olga", "manicure-hardware", At(1, 10, 30), BookingStatus.Confirmed),
            new(MeMaster, "c-darya", "manicure-gel", At(3, 13, 30), BookingStatus.Confirmed),
            new(MeMaster, "c-elena", "manicure-removal", At(6, 16, 30), BookingStatus.Confirmed)
        };

        (int Day, int Hour, int Minute, string Client, BookingStatus Status)[] history =
        [
            (-1, 10, 30, "c-alina", BookingStatus.Completed),
            (-1, 15, 0, "c-maria", BookingStatus.Completed),
            (-2, 12, 0, "c-darya", BookingStatus.NoShow),
            (-3, 9, 0, "c-olga", BookingStatus.Completed),
            (-4, 13, 30, "c-elena", BookingStatus.Cancelled),
            (-5, 10, 30, "c-viktoria", BookingStatus.Completed),
            (-6, 16, 30, "c-maria", BookingStatus.Completed),
            (-8, 9, 0, "c-alina", BookingStatus.Completed),
            (-9, 12, 0, "c-darya", BookingStatus.Completed),
            (-11, 15, 0, "c-olga", BookingStatus.Completed),
            (-13, 10, 30, "c-elena", BookingStatus.NoShow),
            (-15, 13, 30, "c-viktoria", BookingStatus.Completed),
            (-18, 9, 0, "c-maria", BookingStatus.Cancelled),
            (-21, 12, 0, "c-alina", BookingStatus.Completed),
            (-25, 16, 30, "c-darya", BookingStatus.Completed),
            (-28, 10, 30, "c-olga", BookingStatus.Completed)
        ];

        bookings.AddRange(history.Select((row, i) => new DemoBooking(
            MeMaster,
            row.Client,
            i % 3 == 0 ? "manicure-hardware" : "manicure-gel",
            At(row.Day, row.Hour, row.Minute),
            row.Status,
            CancelReason: row.Status == BookingStatus.Cancelled ? "Изменились планы" : null)));

        return bookings;
    }

    public static IReadOnlyList<DemoReview> Reviews(DateTimeOffset now)
    {
        var today = MinskTime.Today(now);
        DateTimeOffset At(int day, int hour) => MinskTime.At(today.AddDays(day), new TimeOnly(hour, 0));

        return
        [
            new("m-anna-serova", Me, Party.Client, "manicure-gel", 5, "Отличная работа, очень довольна результатом!", At(-50, 18)),
            new("m-oksana-lebed", Me, Party.Client, "lashes-classic", 4, "Работа аккуратная, но немного долго.", At(-75, 20)),
            new("m-anna-serova", Me, Party.Master, "manicure-gel", 5, "Пунктуальная и очень приятная клиентка, приходите ещё!", At(-50, 19)),
            new("m-oksana-lebed", Me, Party.Master, "lashes-classic", 5, "Всё отлично, без опозданий.", At(-75, 21)),
            new(MeMaster, "c-alina", Party.Client, "manicure-hardware", 5, "Анна — золото! Всегда аккуратно.", At(-1, 19))
        ];
    }

    private static DateTimeOffset Soon(DateTimeOffset now, double hoursAhead)
    {
        var step = TimeSpan.FromMinutes(SoonStepMinutes).Ticks;
        var target = now.AddHours(hoursAhead).UtcTicks;
        return new DateTimeOffset((target + step - 1) / step * step, TimeSpan.Zero);
    }
}
