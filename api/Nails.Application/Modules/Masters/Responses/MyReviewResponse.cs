namespace Nails.Application.Modules.Masters.Responses;

public sealed record MyReviewResponse(
    Guid Id,
    Guid MasterId,
    string MasterName,
    string? MasterPhotoUrl,
    string ServiceName,
    int Rating,
    string Text,
    DateTimeOffset Date);
