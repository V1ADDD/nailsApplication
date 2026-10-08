namespace Nails.Application.Modules.Identity.Responses;

public sealed record PhoneCodeResponse(bool CodeRequired, int CodeLength, int ResendAfterSeconds);
