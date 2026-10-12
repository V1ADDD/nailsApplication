namespace Nails.Application.Modules.Masters.Responses;

public sealed record ReviewResponse(
    Guid Id,
    string SubcategoryId,
    string ServiceName,
    int Rating,
    string Text,
    DateTimeOffset Date,
    string AuthorName);
