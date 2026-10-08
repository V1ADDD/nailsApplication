using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Catalog.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Catalog.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories", DatabaseSchemas.Catalog);
        builder.HasKey(category => category.Id);
        builder.Property(category => category.Id).HasMaxLength(Category.IdMaxLength);
        builder.Property(category => category.Name).HasMaxLength(Category.NameMaxLength);
        builder.HasData(
            new Category { Id = "nails", Name = "Ногти", SortOrder = 1 },
            new Category { Id = "brows", Name = "Брови", SortOrder = 2 },
            new Category { Id = "lashes", Name = "Ресницы", SortOrder = 3 },
            new Category { Id = "cosmetology", Name = "Косметология", SortOrder = 4 },
            new Category { Id = "makeup", Name = "Макияж", SortOrder = 5 },
            new Category { Id = "depilation", Name = "Депиляция", SortOrder = 6 });
    }
}
