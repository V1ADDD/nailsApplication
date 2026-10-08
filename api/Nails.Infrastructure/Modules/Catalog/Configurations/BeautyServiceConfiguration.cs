using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Catalog.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Catalog.Configurations;

public sealed class BeautyServiceConfiguration : IEntityTypeConfiguration<BeautyService>
{
    public void Configure(EntityTypeBuilder<BeautyService> builder)
    {
        builder.ToTable("services", DatabaseSchemas.Catalog);
        builder.HasKey(service => service.Id);
        builder.Property(service => service.Id).HasMaxLength(Category.IdMaxLength);
        builder.Property(service => service.CategoryId).HasMaxLength(Category.IdMaxLength);
        builder.Property(service => service.Name).HasMaxLength(Category.NameMaxLength);
        builder.HasIndex(service => service.CategoryId);
        builder.HasOne<Category>().WithMany().HasForeignKey(service => service.CategoryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasData(
            Service("manicure-classic", "nails", "Маникюр классический", 1),
            Service("manicure-gel", "nails", "Маникюр с покрытием гель-лак", 2),
            Service("nail-extension", "nails", "Наращивание ногтей", 3),
            Service("pedicure-classic", "nails", "Педикюр классический", 4),
            Service("pedicure-gel", "nails", "Педикюр с покрытием гель-лак", 5),
            Service("nail-design", "nails", "Дизайн ногтей", 6),
            Service("brow-correction", "brows", "Коррекция бровей", 1),
            Service("brow-tint", "brows", "Окрашивание бровей", 2),
            Service("brow-lamination", "brows", "Ламинирование бровей", 3),
            Service("brow-permanent", "brows", "Перманентный макияж бровей", 4),
            Service("lash-extension-classic", "lashes", "Наращивание ресниц, классика", 1),
            Service("lash-extension-volume", "lashes", "Наращивание ресниц, объём", 2),
            Service("lash-lamination", "lashes", "Ламинирование ресниц", 3),
            Service("lash-tint", "lashes", "Окрашивание ресниц", 4),
            Service("face-cleansing", "cosmetology", "Чистка лица", 1),
            Service("face-peeling", "cosmetology", "Пилинг лица", 2),
            Service("face-massage", "cosmetology", "Массаж лица", 3),
            Service("face-care", "cosmetology", "Уходовая процедура для лица", 4),
            Service("makeup-day", "makeup", "Дневной макияж", 1),
            Service("makeup-evening", "makeup", "Вечерний макияж", 2),
            Service("makeup-wedding", "makeup", "Свадебный макияж", 3),
            Service("sugaring", "depilation", "Шугаринг", 1),
            Service("wax-depilation", "depilation", "Восковая депиляция", 2),
            Service("laser-hair-removal", "depilation", "Лазерная эпиляция", 3));
    }

    private static BeautyService Service(string id, string categoryId, string name, int sortOrder) =>
        new() { Id = id, CategoryId = categoryId, Name = name, SortOrder = sortOrder };
}
