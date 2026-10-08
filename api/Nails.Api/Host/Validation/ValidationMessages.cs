using System.ComponentModel.DataAnnotations;

namespace Nails.Api.Host.Validation;

public static class ValidationMessages
{
    public const string InvalidValue = "Значение указано неверно.";

    public static string For(ValidationAttribute attribute) => attribute switch
    {
        RequiredAttribute => "Заполните это поле.",
        EmailAddressAttribute => "Укажите адрес электронной почты.",
        MaxLengthAttribute => "Не больше {1} символов.",
        MinLengthAttribute => "Не меньше {1} символов.",
        StringLengthAttribute => "Не больше {1} символов.",
        RangeAttribute => "Укажите значение от {1} до {2}.",
        _ => InvalidValue
    };
}
