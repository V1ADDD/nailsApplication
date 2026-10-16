using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Chats.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Chats.Configurations;

public sealed class ChatConfiguration : IEntityTypeConfiguration<Chat>
{
    public void Configure(EntityTypeBuilder<Chat> builder)
    {
        builder.ToTable("chats", DatabaseSchemas.Chats);
        builder.HasKey(chat => chat.Id);
        builder.HasIndex(chat => new { chat.MasterId, chat.ClientUserId }).IsUnique();
        builder.HasIndex(chat => new { chat.ClientUserId, chat.LastMessageAt }).IsDescending(false, true);
        builder.HasIndex(chat => new { chat.MasterId, chat.LastMessageAt }).IsDescending(false, true);
        builder.Property(chat => chat.BlockedBy).HasConversion<string>().HasMaxLength(ChatsColumns.EnumMaxLength);
        builder.Property(chat => chat.Version).IsConcurrencyToken();
    }
}
