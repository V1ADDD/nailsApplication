namespace Starter.Application.Modules.Notes.Responses;

public sealed record NoteSummaryResponse(Guid Id, string Title, DateTimeOffset UpdatedAt);
