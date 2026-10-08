using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Nails.Infrastructure.Modules.Support.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Support.Configurations;

public sealed class SupportTicketConfiguration : IEntityTypeConfiguration<SupportTicket>
{
    private const int StatusMaxLength = 20;

    public void Configure(EntityTypeBuilder<SupportTicket> builder)
    {
        builder.ToTable("tickets", DatabaseSchemas.Support);
        builder.HasKey(ticket => ticket.Id);
        builder.Property(ticket => ticket.Text).HasMaxLength(SupportTicket.TextMaxLength);
        builder.Property(ticket => ticket.Contact).HasMaxLength(SupportTicket.ContactMaxLength);
        builder.Property(ticket => ticket.Status).HasConversion<string>().HasMaxLength(StatusMaxLength);
        builder.HasIndex(ticket => ticket.CreatedAt);
    }
}
