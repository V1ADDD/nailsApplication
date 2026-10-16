using Nails.Application.Common.Exceptions;

namespace Nails.Application.Common.Media;

public static class MediaErrors
{
    public static InvalidRequestException WrongType() => new(ErrorCodes.MediaType, "Можно загрузить только фото (JPG, PNG, WebP)");

    public static InvalidRequestException TooLarge() => new(ErrorCodes.MediaTooLarge, "Фото больше 10 МБ");

    public static NotFoundException NotFound() => new(ErrorCodes.MediaNotFound, "Фото не найдено");

    public static ForbiddenException NotOwned() => new(ErrorCodes.MediaNotOwned, "Это фото загрузил другой человек");
}
