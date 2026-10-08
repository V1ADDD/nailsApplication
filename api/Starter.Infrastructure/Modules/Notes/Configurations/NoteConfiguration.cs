using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Starter.Infrastructure.Modules.Notes.Entities;
using Starter.Infrastructure.Persistence;

namespace Starter.Infrastructure.Modules.Notes.Configurations;

public sealed class NoteConfiguration : IEntityTypeConfiguration<Note>
{
    public void Configure(EntityTypeBuilder<Note> builder)
    {
        builder.ToTable("notes", DatabaseSchemas.Notes);
        builder.HasKey(note => note.Id);
        builder.Property(note => note.Title).HasMaxLength(Note.TitleMaxLength);
        builder.Property(note => note.NormalizedTitle).HasMaxLength(Note.TitleMaxLength);
        builder.Property(note => note.Content).HasMaxLength(Note.ContentMaxLength);
        builder.Property(note => note.Version).IsConcurrencyToken();
        builder.HasIndex(note => new { note.TenantId, note.UpdatedAt });
        builder.HasIndex(note => new { note.TenantId, note.NormalizedTitle });
    }
}
