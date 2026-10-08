using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Configurations;

public sealed class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
{
    public void Configure(EntityTypeBuilder<Schedule> builder)
    {
        builder.ToTable("schedules", DatabaseSchemas.Masters);
        builder.HasKey(schedule => schedule.MasterId);
        builder.OwnsMany(schedule => schedule.Breaks, breaks => breaks.ToJson());
    }
}
