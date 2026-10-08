using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Configurations;

public sealed class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("courses", DatabaseSchemas.Masters);
        builder.HasKey(course => course.Id);
        builder.HasIndex(course => course.MasterId);
        builder.Property(course => course.Title).HasMaxLength(Course.TextMaxLength);
        builder.Property(course => course.School).HasMaxLength(Course.TextMaxLength);
    }
}
