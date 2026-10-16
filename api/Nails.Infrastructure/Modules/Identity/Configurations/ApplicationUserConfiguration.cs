using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Identity.Configurations;

public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    private const int RoleMaxLength = 20;
    private const int ModeMaxLength = 10;
    private const int ContactMaxLength = 10;
    private const string EmailIndexName = "EmailIndex";
    private const string EmailIndexFilter = "\"normalized_email\" IS NOT NULL";

    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("users", DatabaseSchemas.Identity);
        builder.Property(user => user.DisplayName).HasMaxLength(ApplicationUser.DisplayNameMaxLength);
        builder.Property(user => user.Role).HasConversion<string>().HasMaxLength(RoleMaxLength);
        builder.Property(user => user.ActiveMode).HasConversion<string>().HasMaxLength(ModeMaxLength).HasDefaultValue(UserMode.Client).HasSentinel(UserMode.Client);
        builder.Property(user => user.PhotoUrl).HasMaxLength(ApplicationUser.PhotoUrlMaxLength);
        builder.Property(user => user.Telegram).HasMaxLength(ApplicationUser.TelegramMaxLength);
        builder.Property(user => user.Viber).HasMaxLength(ApplicationUser.ViberMaxLength);
        builder.Property(user => user.PreferredContact).HasConversion<string>().HasMaxLength(ContactMaxLength).HasDefaultValue(PreferredContact.Messages).HasSentinel(PreferredContact.Messages);
        builder.Property(user => user.NotifyPush).HasDefaultValue(true).HasSentinel(true);
        builder.Property(user => user.NotifyEmail).HasDefaultValue(true).HasSentinel(true);
        builder.Property(user => user.NotifySite).HasDefaultValue(true).HasSentinel(true);
        builder.Property(user => user.NotifyReminders).HasDefaultValue(true).HasSentinel(true);
        builder.HasIndex(user => user.NormalizedEmail).HasDatabaseName(EmailIndexName).IsUnique().HasFilter(EmailIndexFilter);
        builder.HasIndex(user => user.TenantId);
        builder.HasOne<Tenant>().WithMany().HasForeignKey(user => user.TenantId).OnDelete(DeleteBehavior.Restrict);
    }
}
