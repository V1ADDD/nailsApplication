namespace Nails.Application.Modules.Masters.Responses;

public sealed record MyReviewsResponse(
    int WrittenCount,
    int AboutCount,
    IReadOnlyList<MyReviewResponse> Items,
    int Page,
    int PageSize,
    int TotalCount);
