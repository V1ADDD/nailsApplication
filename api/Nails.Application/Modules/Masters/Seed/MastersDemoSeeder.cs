using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Nails.Application.Common.Time;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Options;
using Nails.Infrastructure.Persistence;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Masters.Seed;

public sealed class MastersDemoSeeder(AppDbContext dbContext, TimeProvider clock, IOptions<DemoOptions> options) : IDemoSeeder
{
    private const int SlotDays = 14;
    private const int BusyDays = 3;
    private const double NearBusyChance = 0.55;
    private const double FarBusyChance = 0.3;
    private const double BookedShare = 0.8;
    private const int CourseExperience = 3;
    private const int HueStep = 37;
    private const int HueOffset = 41;
    private const int FullCircle = 360;
    private const int PhoneBase = 1_234_567;
    private const int PhoneStep = 73_517;
    private const int PhoneDigits = 7;
    private const int HistoryDays = 700;
    private const int HistoryTimes = 5;
    private const int ReviewSpreadDays = 365;
    private const int ReviewOffsetDays = 3;
    private const int ReviewDayStep = 3;
    private const int MinRating = 1;
    private const int MaxRating = 5;

    private static readonly string[] Operators = ["29", "33", "44", "25"];
    private static readonly TimeOnly HistoryStart = new(10, 0);
    private static readonly TimeOnly ReviewTime = new(18, 0);
    private static readonly (string Title, string School, int Year)[] Courses =
    [
        ("Аппаратный маникюр: базовый курс", "Школа Nail Pro, Минск", 2019),
        ("Архитектура покрытия", "Академия ногтевого сервиса", 2022)
    ];

    public int Order => 20;

    public async Task ResetAsync(CancellationToken cancellationToken)
    {
        var masterIds = MasterIds();
        var userIds = UserIds();
        await dbContext.Set<Favorite>()
            .Where(favorite => masterIds.Contains(favorite.MasterId) || userIds.Contains(favorite.UserId))
            .ExecuteDeleteAsync(cancellationToken);
        await dbContext.Set<Review>().Where(review => masterIds.Contains(review.MasterId)).ExecuteDeleteAsync(cancellationToken);
        await dbContext.Set<Booking>().Where(booking => masterIds.Contains(booking.MasterId)).ExecuteDeleteAsync(cancellationToken);
        await dbContext.Set<Slot>().Where(slot => masterIds.Contains(slot.MasterId)).ExecuteDeleteAsync(cancellationToken);
        await dbContext.Set<Schedule>().Where(schedule => masterIds.Contains(schedule.MasterId)).ExecuteDeleteAsync(cancellationToken);
        await dbContext.Set<PortfolioPhoto>().Where(photo => masterIds.Contains(photo.MasterId)).ExecuteDeleteAsync(cancellationToken);
        await dbContext.Set<Course>().Where(course => masterIds.Contains(course.MasterId)).ExecuteDeleteAsync(cancellationToken);
        await dbContext.Set<MasterService>().Where(service => masterIds.Contains(service.MasterId)).ExecuteDeleteAsync(cancellationToken);
        await dbContext.Set<Master>().Where(master => masterIds.Contains(master.Id)).ExecuteDeleteAsync(cancellationToken);
    }

    public async Task SeedAsync(CancellationToken cancellationToken)
    {
        var masterIds = MasterIds();

        if (await dbContext.Set<Master>().AnyAsync(master => masterIds.Contains(master.Id), cancellationToken))
        {
            return;
        }

        var now = clock.GetUtcNow();
        var rows = MastersDemoData.Masters.ToDictionary(row => row.Slug, StringComparer.Ordinal);
        var slots = new List<Slot>();
        var bookings = new List<Booking>();

        foreach (var (row, index) in MastersDemoData.Masters.Select((row, index) => (row, index)))
        {
            var masterId = DemoIds.For(row.Slug);
            var schedule = ScheduleFor(row.Slug, masterId);
            AddProfile(row, index, masterId);
            dbContext.Set<Schedule>().Add(schedule);
            slots.AddRange(SlotsFor(masterId, schedule, index, now));
        }

        foreach (var demo in MastersDemoScenario.Bookings(now))
        {
            var booking = ToBooking(rows[demo.Master], demo, now);
            bookings.Add(booking);

            if (booking.StartAt > now && booking.Status is BookingStatus.Pending or BookingStatus.Confirmed)
            {
                Occupy(slots, booking);
            }
        }

        foreach (var row in MastersDemoData.Masters)
        {
            bookings.AddRange(History(row, bookings, now));
        }

        dbContext.Set<Slot>().AddRange(slots);
        dbContext.Set<Booking>().AddRange(bookings);
        dbContext.Set<Review>().AddRange(Reviews(now));
        dbContext.Set<Favorite>().AddRange(MastersDemoScenario.Favorites.Select(slug => new Favorite
        {
            UserId = DemoIds.User(MastersDemoScenario.Me),
            MasterId = DemoIds.For(slug),
            CreatedAt = now
        }));

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private void AddProfile(DemoMasterRow row, int index, Guid masterId)
    {
        var phone = PhoneFor(index);
        dbContext.Set<Master>().Add(new Master
        {
            Id = masterId,
            UserId = DemoIds.User(row.Slug == MastersDemoScenario.MeMaster ? MastersDemoScenario.Me : row.Slug),
            Name = row.Name,
            PhotoUrl = row.Photo is { } photo ? string.Format(CultureInfo.InvariantCulture, options.Value.PhotoUrlFormat, photo) : null,
            Specialty = row.Specialty,
            CategoryIds = [.. row.CategoryIds],
            City = row.City,
            District = row.District,
            Address = row.Address,
            Lat = row.Lat,
            Lng = row.Lng,
            ExperienceYears = row.Experience,
            About = row.About,
            VerificationStatus = row.Verified ? VerificationStatus.Verified : VerificationStatus.None,
            ShowOnline = true,
            Phone = phone,
            Email = row.Slug[2..].Replace('-', '.') + "@mail.by",
            Telegram = row.Telegram,
            Viber = row.Viber ? phone : null,
            Instagram = row.Instagram
        });

        dbContext.Set<MasterService>().AddRange(row.Services.Select((service, order) => new MasterService
        {
            Id = DemoIds.For($"{row.Slug}-s{order}"),
            MasterId = masterId,
            SubcategoryId = service.SubcategoryId,
            PriceKind = service.Kind,
            PriceAmount = service.Amount,
            DurationMin = service.DurationMin,
            SortOrder = order
        }));

        if (row.Experience >= CourseExperience)
        {
            dbContext.Set<Course>().AddRange(Courses.Select((course, order) => new Course
            {
                Id = DemoIds.For($"{row.Slug}-c{order}"),
                MasterId = masterId,
                Title = course.Title,
                School = course.School,
                Year = course.Year,
                SortOrder = order
            }));
        }

        dbContext.Set<PortfolioPhoto>().AddRange(Enumerable.Range(0, row.Portfolio).Select(order => new PortfolioPhoto
        {
            Id = DemoIds.For($"{row.Slug}-p{order}"),
            MasterId = masterId,
            Hue = (((index + 1) * HueStep) + (order * HueOffset)) % FullCircle,
            SortOrder = order
        }));
    }

    private static Schedule ScheduleFor(string slug, Guid masterId) => slug == MastersDemoScenario.MeMaster
        ? new Schedule
        {
            MasterId = masterId,
            WorkDays = [1, 2, 3, 4, 5, 6],
            TimeFrom = new TimeOnly(9, 0),
            TimeTo = new TimeOnly(19, 0),
            SlotMinutes = 90,
            Breaks = [new ScheduleBreak { From = new TimeOnly(13, 30), To = new TimeOnly(15, 0) }],
            Capacity = 1,
            AutoConfirmAfterMinutes = 30
        }
        : new Schedule
        {
            MasterId = masterId,
            WorkDays = [1, 2, 3, 4, 5],
            TimeFrom = new TimeOnly(10, 0),
            TimeTo = new TimeOnly(19, 0),
            SlotMinutes = 90,
            Capacity = 1,
            AutoConfirmAfterMinutes = 30
        };

    private static IEnumerable<Slot> SlotsFor(Guid masterId, Schedule schedule, int index, DateTimeOffset now)
    {
        var random = new DemoRandom(index + 1);
        var today = MinskTime.Today(now);
        var times = ScheduleTemplate.Times(
            schedule.TimeFrom,
            schedule.TimeTo,
            schedule.SlotMinutes,
            [.. schedule.Breaks.Select(pause => (pause.From, pause.To))]);

        for (var day = 0; day < SlotDays; day++)
        {
            var date = today.AddDays(day);

            if (!schedule.WorkDays.Contains(IsoWeekday(date)))
            {
                continue;
            }

            foreach (var time in times)
            {
                var start = MinskTime.At(date, time);

                if (start <= now)
                {
                    continue;
                }

                var roll = random.Next();
                var busy = day < BusyDays ? NearBusyChance : FarBusyChance;
                yield return new Slot
                {
                    Id = Guid.CreateVersion7(),
                    MasterId = masterId,
                    StartAt = start,
                    DurationMin = schedule.SlotMinutes,
                    Status = roll < busy * BookedShare ? SlotStatus.Booked : roll < busy ? SlotStatus.Busy : SlotStatus.Free
                };
            }
        }
    }

    private static void Occupy(List<Slot> slots, Booking booking)
    {
        var slot = slots.FirstOrDefault(slot => slot.MasterId == booking.MasterId && slot.StartAt == booking.StartAt);

        if (slot is null)
        {
            var end = booking.StartAt.AddMinutes(booking.DurationMin);
            slots.RemoveAll(other => other.MasterId == booking.MasterId
                && other.StartAt < end
                && booking.StartAt < other.StartAt.AddMinutes(other.DurationMin));
            slot = new Slot { Id = Guid.CreateVersion7(), MasterId = booking.MasterId, StartAt = booking.StartAt, DurationMin = booking.DurationMin };
            slots.Add(slot);
        }

        booking.SlotId = slot.Id;
        slot.BookingId = booking.Id;
        slot.Status = booking.Status == BookingStatus.Pending
            ? SlotStatus.Pending
            : booking.Source == BookingSource.External ? SlotStatus.Busy : SlotStatus.Booked;
    }

    private static Booking ToBooking(DemoMasterRow row, DemoBooking demo, DateTimeOffset now)
    {
        var service = row.Services.First(service => service.SubcategoryId == demo.SubcategoryId);
        var created = now.AddMinutes(-demo.CreatedMinutesAgo);
        var done = demo.Status is BookingStatus.Confirmed or BookingStatus.Completed;
        var cancelled = demo.Status == BookingStatus.Cancelled;

        return new Booking
        {
            Id = Guid.CreateVersion7(),
            MasterId = DemoIds.For(row.Slug),
            ClientUserId = demo.Client is { } client ? DemoIds.User(client) : null,
            ExternalClientName = demo.ExternalClientName,
            SubcategoryId = demo.SubcategoryId,
            PriceKind = service.Kind,
            PriceAmount = service.Amount,
            StartAt = demo.StartAt,
            DurationMin = service.DurationMin,
            Address = row.Address,
            Status = demo.Status,
            Source = demo.Source,
            CreatedBy = demo.CreatedBy,
            ConfirmedAt = done ? created : null,
            CancelledAt = cancelled ? demo.StartAt.AddDays(-1) : null,
            CancelledBy = cancelled ? Party.Client : null,
            CancelReason = demo.CancelReason,
            CancelMutual = demo.CancelMutual,
            Note = demo.Note,
            CreatedAt = created
        };
    }

    private static IEnumerable<Booking> History(DemoMasterRow row, List<Booking> bookings, DateTimeOffset now)
    {
        var masterId = DemoIds.For(row.Slug);
        var missing = row.Bookings - bookings.Count(booking => booking.MasterId == masterId && booking.Status == BookingStatus.Completed);
        var today = MinskTime.Today(now);

        for (var i = 0; i < missing; i++)
        {
            var service = row.Services[i % row.Services.Count];
            var start = MinskTime.At(
                today.AddDays(-(i % HistoryDays) - 1),
                HistoryStart.AddMinutes(i % HistoryTimes * service.DurationMin));
            yield return ToBooking(
                row,
                new DemoBooking(row.Slug, MastersDemoScenario.Clients[i % MastersDemoScenario.Clients.Count], service.SubcategoryId, start, BookingStatus.Completed),
                start);
        }
    }

    private static IEnumerable<Review> Reviews(DateTimeOffset now)
    {
        var today = MinskTime.Today(now);
        var fixedReviews = MastersDemoScenario.Reviews(now);

        foreach (var review in fixedReviews)
        {
            yield return ToReview(review);
        }

        foreach (var (row, index) in MastersDemoData.Masters.Select((row, index) => (row, index)))
        {
            var given = fixedReviews.Where(review => review.Master == row.Slug && review.Author == Party.Client).ToList();
            var remaining = row.Reviews - given.Count;

            if (remaining <= 0)
            {
                continue;
            }

            var target = (int)Math.Round(row.Rating * row.Reviews, MidpointRounding.AwayFromZero) - given.Sum(review => review.Rating);
            var floor = Math.Clamp(target / remaining, MinRating, MaxRating);
            var extra = Math.Clamp(target - (floor * remaining), 0, remaining);

            for (var i = 0; i < remaining; i++)
            {
                var rating = Math.Min(MaxRating, i < extra ? floor + 1 : floor);
                yield return ToReview(new DemoReview(
                    row.Slug,
                    MastersDemoScenario.Clients[(index + i) % MastersDemoScenario.Clients.Count],
                    Party.Client,
                    row.Services[i % row.Services.Count].SubcategoryId,
                    rating,
                    TextFor(rating, index + i),
                    MinskTime.At(today.AddDays(-((i * ReviewDayStep % ReviewSpreadDays) + ReviewOffsetDays)), ReviewTime)));
            }
        }
    }

    private static string TextFor(int rating, int seed)
    {
        var texts = MastersDemoScenario.ReviewTexts.Where(text => text.Rating == Math.Max(rating, 3)).ToList();
        return texts[seed % texts.Count].Text;
    }

    private static Review ToReview(DemoReview review) => new()
    {
        Id = Guid.CreateVersion7(),
        MasterId = DemoIds.For(review.Master),
        ClientUserId = DemoIds.User(review.Client),
        AuthorRole = review.Author,
        SubcategoryId = review.SubcategoryId,
        Rating = review.Rating,
        Text = review.Text,
        CreatedAt = review.At
    };

    private static string PhoneFor(int index)
    {
        var digits = (PhoneBase + (index * PhoneStep)).ToString(CultureInfo.InvariantCulture);
        return "+375" + Operators[index % Operators.Length] + digits[^PhoneDigits..];
    }

    private static int IsoWeekday(DateOnly date) => date.DayOfWeek == DayOfWeek.Sunday ? 7 : (int)date.DayOfWeek;

    private static List<Guid> MasterIds() => [.. MastersDemoData.Masters.Select(row => DemoIds.For(row.Slug))];

    private static List<Guid> UserIds() =>
    [
        DemoIds.User(MastersDemoScenario.Me),
        .. MastersDemoScenario.Clients.Select(DemoIds.User),
        .. MastersDemoData.Masters.Select(row => DemoIds.User(row.Slug))
    ];
}
