using Nails.Application.Modules.Catalog.Contracts;

namespace Nails.Application.Modules.Catalog.Services;

public static class CatalogData
{
    public static IReadOnlyList<CatalogCategory> Categories { get; } =
    [
        Category("manicure", "Маникюр", "Мастер ногтей", ["ногти", "ноготочки", "нейл", "nail", "ногтевой сервис"],
        [
            Sub("manicure-classic", "Классический маникюр"),
            Sub("manicure-hardware", "Аппаратный маникюр"),
            Sub("manicure-combined", "Комбинированный маникюр"),
            Sub("manicure-french", "Френч"),
            Sub("manicure-gel", "Покрытие гель-лаком", synonyms: ["шеллак", "гель лак", "гельлак", "покрытие"]),
            Sub("manicure-design", "Дизайн ногтей", addon: true),
            Sub("manicure-extension", "Наращивание ногтей"),
            Sub("manicure-removal", "Снятие покрытия", addon: true)
        ]),
        Category("pedicure", "Педикюр", "Мастер педикюра", ["стопы", "ноги"],
        [
            Sub("pedicure-classic", "Классический педикюр"),
            Sub("pedicure-hardware", "Аппаратный педикюр"),
            Sub("pedicure-gel", "Педикюр с покрытием"),
            Sub("pedicure-spa", "SPA-педикюр")
        ]),
        Category("brows", "Брови", "Бровист", ["бровки", "бровист"],
        [
            Sub("brows-correction", "Коррекция бровей"),
            Sub("brows-tint", "Окрашивание бровей"),
            Sub("brows-lamination", "Ламинирование бровей", synonyms: ["долговременная укладка"]),
            Sub("brows-architecture", "Архитектура бровей")
        ]),
        Category("lashes", "Ресницы", "Лешмейкер", ["реснички", "лэш", "лешмейкер", "lash"],
        [
            Sub("lashes-classic", "Наращивание ресниц (классика)"),
            Sub("lashes-volume", "Наращивание ресниц 2D–3D"),
            Sub("lashes-lamination", "Ламинирование ресниц"),
            Sub("lashes-tint", "Окрашивание ресниц")
        ]),
        Category("cosmetology", "Косметология", "Косметолог", ["лицо", "кожа", "уход"],
        [
            Sub("cosmetology-cleansing", "Чистка лица"),
            Sub("cosmetology-peeling", "Пилинг"),
            Sub("cosmetology-massage", "Массаж лица"),
            Sub("cosmetology-care", "Уходовая процедура")
        ]),
        Category("makeup", "Макияж", "Визажист", ["мейкап", "make up", "визаж"],
        [
            Sub("makeup-day", "Дневной макияж"),
            Sub("makeup-evening", "Вечерний макияж"),
            Sub("makeup-wedding", "Свадебный макияж")
        ]),
        Category("depilation", "Депиляция", "Мастер депиляции", ["эпиляция", "удаление волос"],
        [
            Sub("depilation-sugaring", "Шугаринг"),
            Sub("depilation-wax", "Восковая депиляция")
        ])
    ];

    private static CatalogCategory Category(
        string id,
        string name,
        string specialty,
        IReadOnlyList<string> synonyms,
        IReadOnlyList<(string Id, string Name, bool Addon, IReadOnlyList<string> Synonyms)> subcategories) =>
        new(id, name, specialty, synonyms, [.. subcategories.Select(sub => new CatalogSubcategory(sub.Id, id, sub.Name, sub.Addon, sub.Synonyms))]);

    private static (string Id, string Name, bool Addon, IReadOnlyList<string> Synonyms) Sub(
        string id,
        string name,
        bool addon = false,
        IReadOnlyList<string>? synonyms = null) =>
        (id, name, addon, synonyms ?? []);
}
