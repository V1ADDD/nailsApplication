namespace Nails.Application.Modules.Identity.Seed;

public static class IdentityDemoData
{
    public static IReadOnlyList<DemoAccount> Accounts { get; } =
    [
        new DemoAccount("c-me", "Анна Новикова", "+375291234567", "m-me", true),
        new DemoAccount("c-alina", "Алина Кравец", "+375296112033", null, false),
        new DemoAccount("c-viktoria", "Виктория Маслова", "+375337024518", null, false),
        new DemoAccount("c-olga", "Ольга Сенько", "+375445551209", null, false),
        new DemoAccount("c-darya", "Дарья Пинчук", "+375293487761", null, false),
        new DemoAccount("c-elena", "Елена Шарко", "+375259016640", null, false),
        new DemoAccount("c-maria", "Мария Лапицкая", "+375332140988", null, false),
        new DemoAccount("m-anna-serova", "Анна Серова", "+375447000001", "m-anna-serova", true),
        new DemoAccount("m-marina-kovaleva", "Марина Ковалёва", "+375447000002", "m-marina-kovaleva", true),
        new DemoAccount("m-yulia-pavlova", "Юлия Павлова", "+375447000003", "m-yulia-pavlova", false),
        new DemoAccount("m-oksana-lebed", "Оксана Лебедь", "+375447000004", "m-oksana-lebed", true),
        new DemoAccount("m-ekaterina-zhuk", "Екатерина Жук", "+375447000005", "m-ekaterina-zhuk", false),
        new DemoAccount("m-darya-klimovich", "Дарья Климович", "+375447000006", "m-darya-klimovich", true),
        new DemoAccount("m-olga-novik", "Ольга Новик", "+375447000007", "m-olga-novik", false),
        new DemoAccount("m-viktoria-sidorenko", "Виктория Сидоренко", "+375447000008", "m-viktoria-sidorenko", false),
        new DemoAccount("m-alena-melnik", "Алёна Мельник", "+375447000009", "m-alena-melnik", true),
        new DemoAccount("m-ksenia-bondar", "Ксения Бондарь", "+375447000010", "m-ksenia-bondar", false),
        new DemoAccount("m-natalia-gurskaya", "Наталья Гурская", "+375447000011", "m-natalia-gurskaya", true),
        new DemoAccount("m-tatiana-lis", "Татьяна Лис", "+375447000012", "m-tatiana-lis", true),
        new DemoAccount("m-polina-shevchuk", "Полина Шевчук", "+375447000013", "m-polina-shevchuk", false),
        new DemoAccount("m-svetlana-kozlova", "Светлана Козлова", "+375447000014", "m-svetlana-kozlova", false),
        new DemoAccount("m-elizaveta-romanovich", "Елизавета Романович", "+375447000015", "m-elizaveta-romanovich", true),
        new DemoAccount("m-alina-statkevich", "Алина Статкевич", "+375447000016", "m-alina-statkevich", false),
        new DemoAccount("m-irina-goncharova", "Ирина Гончарова", "+375447000017", "m-irina-goncharova", false),
        new DemoAccount("m-maria-dubovik", "Мария Дубовик", "+375447000018", "m-maria-dubovik", true),
        new DemoAccount("m-veronika-pashkevich", "Вероника Пашкевич", "+375447000019", "m-veronika-pashkevich", false),
        new DemoAccount("m-kristina-zhdanovich", "Кристина Жданович", "+375447000020", "m-kristina-zhdanovich", true),
        new DemoAccount("m-yana-kovalchuk", "Яна Ковальчук", "+375447000021", "m-yana-kovalchuk", false),
        new DemoAccount("m-lyudmila-savitskaya", "Людмила Савицкая", "+375447000022", "m-lyudmila-savitskaya", false),
        new DemoAccount("m-diana-yurkevich", "Диана Юркевич", "+375447000023", "m-diana-yurkevich", true),
        new DemoAccount("m-anastasia-radyuk", "Анастасия Радюк", "+375447000024", "m-anastasia-radyuk", false),
        new DemoAccount("m-aleksandra-kostyuchenko", "Александра Константиновна Костюченко-Вишневская", "+375447000025", "m-aleksandra-kostyuchenko", false)
    ];
}
