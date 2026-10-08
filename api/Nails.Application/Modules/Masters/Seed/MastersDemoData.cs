using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Seed;

public static class MastersDemoData
{
    public static IReadOnlyList<DemoMasterRow> Masters { get; } =
    [
        new DemoMasterRow
        {
            Slug = "m-anna-serova",
            Name = "Анна Серова",
            Photo = 44,
            CategoryIds = ["manicure", "pedicure"],
            Specialty = "Мастер ногтей",
            City = "Минск",
            District = "Центральный",
            Address = "ул. Ленина, 42",
            Lat = 53.9002,
            Lng = 27.5592,
            Rating = 4.9,
            Reviews = 214,
            Experience = 7,
            Verified = true,
            Bookings = 1320,
            About = "Делаю аккуратный аппаратный маникюр и стойкое покрытие, которое носится 3–4 недели. Стерилизация инструмента в сухожаре, одноразовые пилки.",
            Telegram = "anna_serova_nails",
            Instagram = "serova.nails",
            Viber = true,
            Portfolio = 9,
            Services =
            [
                new DemoServiceRow("manicure-hardware", PriceKind.Exact, 35m, 60),
                new DemoServiceRow("manicure-combined", PriceKind.Exact, 45m, 90),
                new DemoServiceRow("manicure-gel", PriceKind.From, 40m, 90),
                new DemoServiceRow("manicure-french", PriceKind.Exact, 55m, 120),
                new DemoServiceRow("manicure-design", PriceKind.From, 3m, 15),
                new DemoServiceRow("manicure-removal", PriceKind.Exact, 10m, 20),
                new DemoServiceRow("pedicure-hardware", PriceKind.Exact, 60m, 90)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-marina-kovaleva",
            Name = "Марина Ковалёва",
            Photo = 68,
            CategoryIds = ["brows", "lashes"],
            Specialty = "Бровист",
            City = "Минск",
            District = "Центральный",
            Address = "пр. Независимости, 17",
            Lat = 53.8969,
            Lng = 27.5563,
            Rating = 4.8,
            Reviews = 98,
            Experience = 5,
            Verified = true,
            Bookings = 610,
            About = "Бровист-архитектор. Подбираю форму под черты лица, работаю с хной и краской.",
            Telegram = "marina_brows",
            Instagram = "marina.brows.minsk",
            Viber = false,
            Portfolio = 6,
            Services =
            [
                new DemoServiceRow("brows-correction", PriceKind.Exact, 15m, 30),
                new DemoServiceRow("brows-tint", PriceKind.Exact, 20m, 30),
                new DemoServiceRow("brows-lamination", PriceKind.Exact, 50m, 60),
                new DemoServiceRow("brows-architecture", PriceKind.Exact, 35m, 60),
                new DemoServiceRow("lashes-lamination", PriceKind.Exact, 55m, 60)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-yulia-pavlova",
            Name = "Юлия Павлова",
            Photo = 65,
            CategoryIds = ["cosmetology"],
            Specialty = "Косметолог",
            City = "Минск",
            District = "Советский",
            Address = "ул. Сурганова, 26",
            Lat = 53.9235,
            Lng = 27.5942,
            Rating = 4.7,
            Reviews = 43,
            Experience = 9,
            Verified = true,
            Bookings = 280,
            About = "Косметолог-эстетист с медицинским образованием. Чистки, пилинги и уходовые программы.",
            Telegram = null,
            Instagram = null,
            Viber = true,
            Portfolio = 4,
            Services =
            [
                new DemoServiceRow("cosmetology-cleansing", PriceKind.Exact, 80m, 90),
                new DemoServiceRow("cosmetology-peeling", PriceKind.From, 60m, 45),
                new DemoServiceRow("cosmetology-massage", PriceKind.Exact, 50m, 60),
                new DemoServiceRow("cosmetology-care", PriceKind.From, 70m, 60)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-oksana-lebed",
            Name = "Оксана Лебедь",
            Photo = 90,
            CategoryIds = ["lashes"],
            Specialty = "Лешмейкер",
            City = "Минск",
            District = "Партизанский",
            Address = "ул. Ванеева, 4",
            Lat = 53.8913,
            Lng = 27.6005,
            Rating = 4.6,
            Reviews = 86,
            Experience = 4,
            Verified = true,
            Bookings = 530,
            About = "",
            Telegram = null,
            Instagram = "oksana.lash",
            Viber = false,
            Portfolio = 8,
            Services =
            [
                new DemoServiceRow("lashes-classic", PriceKind.Exact, 55m, 120),
                new DemoServiceRow("lashes-volume", PriceKind.From, 65m, 150),
                new DemoServiceRow("lashes-lamination", PriceKind.Exact, 50m, 60),
                new DemoServiceRow("lashes-tint", PriceKind.Exact, 15m, 20)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-ekaterina-zhuk",
            Name = "Екатерина Жук",
            Photo = 12,
            CategoryIds = ["manicure"],
            Specialty = "Мастер ногтей",
            City = "Минск",
            District = "Центральный",
            Address = "ул. Немига, 5",
            Lat = 53.9053,
            Lng = 27.5536,
            Rating = 4.5,
            Reviews = 31,
            Experience = 2,
            Verified = false,
            Bookings = 140,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 5,
            Services =
            [
                new DemoServiceRow("manicure-classic", PriceKind.Exact, 25m, 60),
                new DemoServiceRow("manicure-gel", PriceKind.From, 38m, 90),
                new DemoServiceRow("manicure-removal", PriceKind.Exact, 8m, 20)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-darya-klimovich",
            Name = "Дарья Климович",
            Photo = 21,
            CategoryIds = ["manicure", "pedicure"],
            Specialty = "Мастер ногтей",
            City = "Минск",
            District = "Советский",
            Address = "ул. Кальварийская, 1",
            Lat = 53.9087,
            Lng = 27.5431,
            Rating = 5,
            Reviews = 57,
            Experience = 3,
            Verified = true,
            Bookings = 390,
            About = "",
            Telegram = "dasha_nails",
            Instagram = null,
            Viber = false,
            Portfolio = 9,
            Services =
            [
                new DemoServiceRow("manicure-hardware", PriceKind.Exact, 38m, 60),
                new DemoServiceRow("manicure-gel", PriceKind.Exact, 50m, 100),
                new DemoServiceRow("manicure-extension", PriceKind.From, 75m, 150),
                new DemoServiceRow("pedicure-gel", PriceKind.Exact, 65m, 100)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-olga-novik",
            Name = "Ольга Новик",
            Photo = 33,
            CategoryIds = ["pedicure"],
            Specialty = "Мастер педикюра",
            City = "Минск",
            District = "Первомайский",
            Address = "ул. Якуба Коласа, 37",
            Lat = 53.9261,
            Lng = 27.6116,
            Rating = 4.4,
            Reviews = 22,
            Experience = 11,
            Verified = false,
            Bookings = 700,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("pedicure-classic", PriceKind.Exact, 45m, 60),
                new DemoServiceRow("pedicure-hardware", PriceKind.Exact, 55m, 75),
                new DemoServiceRow("pedicure-spa", PriceKind.Exact, 70m, 90)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-viktoria-sidorenko",
            Name = "Виктория Сидоренко",
            Photo = 47,
            CategoryIds = ["makeup"],
            Specialty = "Визажист",
            City = "Минск",
            District = "Центральный",
            Address = "ул. Интернациональная, 23",
            Lat = 53.9019,
            Lng = 27.5615,
            Rating = 4.9,
            Reviews = 64,
            Experience = 6,
            Verified = true,
            Bookings = 310,
            About = "",
            Telegram = null,
            Instagram = "vika.makeup.by",
            Viber = false,
            Portfolio = 7,
            Services =
            [
                new DemoServiceRow("makeup-day", PriceKind.Exact, 60m, 60),
                new DemoServiceRow("makeup-evening", PriceKind.Exact, 85m, 75),
                new DemoServiceRow("makeup-wedding", PriceKind.From, 150m, 120)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-alena-melnik",
            Name = "Алёна Мельник",
            Photo = 51,
            CategoryIds = ["depilation"],
            Specialty = "Мастер депиляции",
            City = "Минск",
            District = "Ленинский",
            Address = "ул. Маяковского, 90",
            Lat = 53.8807,
            Lng = 27.5848,
            Rating = 4.3,
            Reviews = 18,
            Experience = 3,
            Verified = false,
            Bookings = 120,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("depilation-sugaring", PriceKind.From, 20m, 45),
                new DemoServiceRow("depilation-wax", PriceKind.From, 18m, 40)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-ksenia-bondar",
            Name = "Ксения Бондарь",
            Photo = 57,
            CategoryIds = ["manicure"],
            Specialty = "Мастер ногтей",
            City = "Минск",
            District = "Фрунзенский",
            Address = "ул. Притыцкого, 62",
            Lat = 53.9076,
            Lng = 27.4702,
            Rating = 4.8,
            Reviews = 73,
            Experience = 5,
            Verified = true,
            Bookings = 480,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 6,
            Services =
            [
                new DemoServiceRow("manicure-combined", PriceKind.Exact, 40m, 80),
                new DemoServiceRow("manicure-gel", PriceKind.From, 45m, 100),
                new DemoServiceRow("manicure-french", PriceKind.Exact, 50m, 110),
                new DemoServiceRow("manicure-design", PriceKind.Free, null, 10)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-natalia-gurskaya",
            Name = "Наталья Гурская",
            Photo = 60,
            CategoryIds = ["brows"],
            Specialty = "Бровист",
            City = "Минск",
            District = "Московский",
            Address = "пр. Дзержинского, 104",
            Lat = 53.8617,
            Lng = 27.4861,
            Rating = 4.2,
            Reviews = 12,
            Experience = 1,
            Verified = false,
            Bookings = 40,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("brows-correction", PriceKind.Exact, 12m, 30),
                new DemoServiceRow("brows-tint", PriceKind.Exact, 15m, 30),
                new DemoServiceRow("brows-lamination", PriceKind.Exact, 40m, 60)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-tatiana-lis",
            Name = "Татьяна Лис",
            Photo = 72,
            CategoryIds = ["cosmetology"],
            Specialty = "Косметолог",
            City = "Минск",
            District = "Октябрьский",
            Address = "ул. Кирова, 13",
            Lat = 53.8979,
            Lng = 27.5493,
            Rating = 4.9,
            Reviews = 105,
            Experience = 12,
            Verified = true,
            Bookings = 900,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 3,
            Services =
            [
                new DemoServiceRow("cosmetology-cleansing", PriceKind.Exact, 95m, 90),
                new DemoServiceRow("cosmetology-peeling", PriceKind.From, 75m, 45),
                new DemoServiceRow("cosmetology-care", PriceKind.From, 85m, 60)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-polina-shevchuk",
            Name = "Полина Шевчук",
            Photo = 79,
            CategoryIds = ["manicure"],
            Specialty = "Мастер ногтей",
            City = "Минск",
            District = "Заводской",
            Address = "ул. Партизанский пр., 81",
            Lat = 53.8695,
            Lng = 27.6481,
            Rating = 4.6,
            Reviews = 39,
            Experience = 4,
            Verified = false,
            Bookings = 260,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("manicure-classic", PriceKind.Exact, 22m, 50),
                new DemoServiceRow("manicure-hardware", PriceKind.Exact, 30m, 60),
                new DemoServiceRow("manicure-gel", PriceKind.From, 35m, 90)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-svetlana-kozlova",
            Name = "Светлана Козлова",
            Photo = 83,
            CategoryIds = ["lashes", "brows"],
            Specialty = "Лешмейкер",
            City = "Минск",
            District = "Советский",
            Address = "ул. Гикало, 9",
            Lat = 53.9195,
            Lng = 27.5876,
            Rating = 4.7,
            Reviews = 48,
            Experience = 6,
            Verified = true,
            Bookings = 340,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 5,
            Services =
            [
                new DemoServiceRow("lashes-classic", PriceKind.Exact, 60m, 120),
                new DemoServiceRow("lashes-volume", PriceKind.Exact, 75m, 150),
                new DemoServiceRow("brows-correction", PriceKind.Exact, 18m, 30)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-elizaveta-romanovich",
            Name = "Елизавета Романович",
            Photo = 26,
            CategoryIds = ["manicure"],
            Specialty = "Мастер ногтей",
            City = "Минск",
            District = "Центральный",
            Address = "ул. Зыбицкая, 6",
            Lat = 53.9073,
            Lng = 27.5618,
            Rating = 3.8,
            Reviews = 9,
            Experience = 1,
            Verified = false,
            Bookings = 25,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("manicure-classic", PriceKind.Exact, 20m, 60),
                new DemoServiceRow("manicure-gel", PriceKind.Exact, 30m, 90)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-alina-statkevich",
            Name = "Алина Статкевич",
            Photo = 38,
            CategoryIds = ["makeup", "brows"],
            Specialty = "Визажист",
            City = "Минск",
            District = "Первомайский",
            Address = "пр. Независимости, 95",
            Lat = 53.9296,
            Lng = 27.6295,
            Rating = 4.5,
            Reviews = 27,
            Experience = 3,
            Verified = false,
            Bookings = 150,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("makeup-day", PriceKind.Exact, 50m, 60),
                new DemoServiceRow("makeup-evening", PriceKind.Exact, 70m, 75),
                new DemoServiceRow("brows-tint", PriceKind.Exact, 18m, 30)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-irina-goncharova",
            Name = "Ирина Гончарова",
            Photo = 9,
            CategoryIds = ["manicure", "pedicure"],
            Specialty = "Мастер ногтей",
            City = "Минск",
            District = "Партизанский",
            Address = "ул. Талбухина, 2",
            Lat = 53.8853,
            Lng = 27.6156,
            Rating = 4.8,
            Reviews = 91,
            Experience = 8,
            Verified = true,
            Bookings = 760,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 9,
            Services =
            [
                new DemoServiceRow("manicure-hardware", PriceKind.Exact, 40m, 60),
                new DemoServiceRow("manicure-gel", PriceKind.Exact, 55m, 100),
                new DemoServiceRow("manicure-extension", PriceKind.Exact, 85m, 150),
                new DemoServiceRow("pedicure-hardware", PriceKind.Exact, 65m, 90),
                new DemoServiceRow("pedicure-spa", PriceKind.Exact, 80m, 100)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-maria-dubovik",
            Name = "Мария Дубовик",
            Photo = 14,
            CategoryIds = ["depilation", "cosmetology"],
            Specialty = "Мастер депиляции",
            City = "Минск",
            District = "Фрунзенский",
            Address = "ул. Каменногорская, 3",
            Lat = 53.9063,
            Lng = 27.4376,
            Rating = 4.4,
            Reviews = 16,
            Experience = 2,
            Verified = false,
            Bookings = 90,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("depilation-sugaring", PriceKind.From, 25m, 45),
                new DemoServiceRow("cosmetology-massage", PriceKind.Exact, 45m, 60)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-veronika-pashkevich",
            Name = "Вероника Пашкевич",
            Photo = 29,
            CategoryIds = ["manicure"],
            Specialty = "Мастер ногтей",
            City = "Минск",
            District = "Октябрьский",
            Address = "ул. Сурганова, 57Б",
            Lat = 53.9303,
            Lng = 27.5836,
            Rating = 4.1,
            Reviews = 14,
            Experience = 2,
            Verified = false,
            Bookings = 70,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("manicure-classic", PriceKind.Exact, 23m, 60),
                new DemoServiceRow("manicure-gel", PriceKind.From, 36m, 90),
                new DemoServiceRow("manicure-design", PriceKind.From, 2m, 15)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-kristina-zhdanovich",
            Name = "Кристина Жданович",
            Photo = 3,
            CategoryIds = ["manicure"],
            Specialty = "Мастер ногтей",
            City = "Брест",
            District = "Ленинский",
            Address = "ул. Советская, 42",
            Lat = 52.0917,
            Lng = 23.6863,
            Rating = 4.8,
            Reviews = 44,
            Experience = 5,
            Verified = true,
            Bookings = 300,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("manicure-hardware", PriceKind.Exact, 30m, 60),
                new DemoServiceRow("manicure-gel", PriceKind.From, 38m, 90)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-yana-kovalchuk",
            Name = "Яна Ковальчук",
            Photo = 6,
            CategoryIds = ["lashes"],
            Specialty = "Лешмейкер",
            City = "Гродно",
            District = "Ленинский",
            Address = "ул. Ожешко, 10",
            Lat = 53.6799,
            Lng = 23.8297,
            Rating = 4.6,
            Reviews = 25,
            Experience = 3,
            Verified = false,
            Bookings = 160,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("lashes-classic", PriceKind.Exact, 45m, 120),
                new DemoServiceRow("lashes-lamination", PriceKind.Exact, 40m, 60)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-lyudmila-savitskaya",
            Name = "Людмила Савицкая",
            Photo = 18,
            CategoryIds = ["brows", "makeup"],
            Specialty = "Бровист",
            City = "Гомель",
            District = "Центральный",
            Address = "ул. Советская, 21",
            Lat = 52.4287,
            Lng = 30.9917,
            Rating = 4.9,
            Reviews = 37,
            Experience = 10,
            Verified = true,
            Bookings = 420,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("brows-architecture", PriceKind.Exact, 30m, 60),
                new DemoServiceRow("makeup-evening", PriceKind.Exact, 65m, 75)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-diana-yurkevich",
            Name = "Диана Юркевич",
            Photo = 24,
            CategoryIds = ["manicure", "pedicure"],
            Specialty = "Мастер ногтей",
            City = "Могилёв",
            District = "Ленинский",
            Address = "ул. Первомайская, 30",
            Lat = 53.8967,
            Lng = 30.3322,
            Rating = 4.3,
            Reviews = 19,
            Experience = 4,
            Verified = false,
            Bookings = 110,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("manicure-combined", PriceKind.Exact, 32m, 80),
                new DemoServiceRow("pedicure-classic", PriceKind.Exact, 40m, 60)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-anastasia-radyuk",
            Name = "Анастасия Радюк",
            Photo = 36,
            CategoryIds = ["cosmetology"],
            Specialty = "Косметолог",
            City = "Витебск",
            District = "Октябрьский",
            Address = "ул. Ленина, 18",
            Lat = 55.1904,
            Lng = 30.2049,
            Rating = 4.7,
            Reviews = 28,
            Experience = 7,
            Verified = true,
            Bookings = 230,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("cosmetology-cleansing", PriceKind.Exact, 70m, 90),
                new DemoServiceRow("cosmetology-peeling", PriceKind.From, 55m, 45)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-aleksandra-kostyuchenko",
            Name = "Александра Константиновна Костюченко-Вишневская",
            Photo = null,
            CategoryIds = ["manicure"],
            Specialty = "Мастер ногтей",
            City = "Минск",
            District = "Ленинский",
            Address = "ул. Серова, 11",
            Lat = 53.8711,
            Lng = 27.5669,
            Rating = 0,
            Reviews = 0,
            Experience = 0,
            Verified = false,
            Bookings = 0,
            About = "",
            Telegram = null,
            Instagram = null,
            Viber = false,
            Portfolio = 0,
            Services =
            [
                new DemoServiceRow("manicure-classic", PriceKind.Exact, 20m, 60)
            ]
        },
        new DemoMasterRow
        {
            Slug = "m-me",
            Name = "Анна Новикова",
            Photo = null,
            CategoryIds = ["manicure"],
            Specialty = "Мастер ногтей",
            City = "Минск",
            District = "Фрунзенский",
            Address = "ул. Притыцкого, 29",
            Lat = 53.9077,
            Lng = 27.4855,
            Rating = 4.8,
            Reviews = 27,
            Experience = 3,
            Verified = false,
            Bookings = 180,
            About = "Маникюр и покрытие гель-лаком в уютной студии у метро «Спортивная».",
            Telegram = "anna_novikova",
            Instagram = null,
            Viber = true,
            Portfolio = 4,
            Services =
            [
                new DemoServiceRow("manicure-hardware", PriceKind.Exact, 35m, 60),
                new DemoServiceRow("manicure-gel", PriceKind.From, 45m, 90),
                new DemoServiceRow("manicure-removal", PriceKind.Exact, 10m, 20)
            ]
        }
    ];
}
