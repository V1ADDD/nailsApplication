namespace Starter.Application.Modules.Notes.Responses;

public sealed record NoteResponse(
    Guid Id,
    string Title,
    string Content,
    Guid AuthorId,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    long Version);
