using System.ComponentModel.DataAnnotations;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Requests;

public sealed class WriteReviewRequest
{
    private const string RatingMessage = "Поставьте оценку";

    [Required(ErrorMessage = RatingMessage)]
    [Range(1, 5, ErrorMessage = RatingMessage)]
    public int? Rating { get; init; }

    [StringLength(Review.TextMaxLength, ErrorMessage = "Не длиннее 1000 символов")]
    public string? Text { get; init; }
}
