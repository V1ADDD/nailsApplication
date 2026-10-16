using System.ComponentModel.DataAnnotations;
using Nails.Application.Modules.Identity.Rules;
using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Application.Modules.Identity.Requests;

public sealed class UpdateProfileRequest
{
    public const int EmailMaxLength = 256;

    [StringLength(SignInRequest.NameMaxLength, ErrorMessage = "Введите имя")]
    public string? Name { get; init; }

    [StringLength(EmailMaxLength, ErrorMessage = "Проверьте адрес почты")]
    public string? Email { get; init; }

    [StringLength(ApplicationUser.PhotoUrlMaxLength, ErrorMessage = "Фото не найдено")]
    public string? PhotoUrl { get; init; }

    [StringLength(TelegramName.MaxInputLength, ErrorMessage = "Проверьте имя в Telegram")]
    public string? Telegram { get; init; }

    [StringLength(BelarusPhone.MaxInputLength, ErrorMessage = "Введите белорусский номер в формате +375 XX XXX-XX-XX")]
    public string? Viber { get; init; }

    public PreferredContact? PreferredContact { get; init; }
}
