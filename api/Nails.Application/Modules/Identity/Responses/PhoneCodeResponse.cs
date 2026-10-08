namespace Nails.Application.Modules.Identity.Responses;

public sealed record PhoneCodeResponse(int CodeLength, int ResendAfterSeconds);
