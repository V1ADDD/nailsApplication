using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Catalog.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Catalog.Configurations;

public sealed class CityConfiguration : IEntityTypeConfiguration<City>
{
    public void Configure(EntityTypeBuilder<City> builder)
    {
        builder.ToTable("cities", DatabaseSchemas.Catalog);
        builder.HasKey(city => city.Id);
        builder.Property(city => city.Id).HasMaxLength(Category.IdMaxLength);
        builder.Property(city => city.Name).HasMaxLength(Category.NameMaxLength);
        builder.HasData(
            Seed("minsk", "Минск", 1),
            Seed("brest", "Брест", 2),
            Seed("vitebsk", "Витебск", 3),
            Seed("gomel", "Гомель", 4),
            Seed("grodno", "Гродно", 5),
            Seed("mogilev", "Могилёв", 6),
            Seed("baranovichi", "Барановичи", 7),
            Seed("bobruisk", "Бобруйск", 8),
            Seed("borisov", "Борисов", 9),
            Seed("pinsk", "Пинск", 10),
            Seed("orsha", "Орша", 11),
            Seed("mozyr", "Мозырь", 12),
            Seed("soligorsk", "Солигорск", 13),
            Seed("novopolotsk", "Новополоцк", 14),
            Seed("lida", "Лида", 15),
            Seed("molodechno", "Молодечно", 16),
            Seed("polotsk", "Полоцк", 17),
            Seed("zhlobin", "Жлобин", 18),
            Seed("svetlogorsk", "Светлогорск", 19),
            Seed("rechitsa", "Речица", 20),
            Seed("slutsk", "Слуцк", 21),
            Seed("zhodino", "Жодино", 22));
    }

    private static City Seed(string id, string name, int sortOrder) => new() { Id = id, Name = name, SortOrder = sortOrder };
}
