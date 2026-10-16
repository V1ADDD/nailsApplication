using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Chats.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Chats.Configurations;

public sealed class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("messages", DatabaseSchemas.Chats, table =>
        {
            table.HasCheckConstraint(
                "ck_messages_text_content",
                "kind <> 'Text' OR deleted_at IS NOT NULL OR text IS NOT NULL OR media_url IS NOT NULL");
            table.HasCheckConstraint("ck_messages_booking", "kind <> 'Booking' OR booking_id IS NOT NULL");
            table.HasCheckConstraint("ck_messages_system", "kind <> 'System' OR (text IS NOT NULL AND author_role IS NULL)");
        });
        builder.HasKey(message => message.Id);
        builder.HasOne<Chat>().WithMany().HasForeignKey(message => message.ChatId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(message => new { message.ChatId, message.SentAt, message.Id });
        builder.HasIndex(message => new { message.ChatId, message.BookingId }).HasFilter("booking_id IS NOT NULL");
        builder.Property(message => message.Kind).HasConversion<string>().HasMaxLength(ChatsColumns.EnumMaxLength);
        builder.Property(message => message.AuthorRole).HasConversion<string>().HasMaxLength(ChatsColumns.EnumMaxLength);
        builder.Property(message => message.Text).HasMaxLength(Message.TextMaxLength);
        builder.Property(message => message.MediaUrl).HasMaxLength(Message.MediaUrlMaxLength);
    }
}
