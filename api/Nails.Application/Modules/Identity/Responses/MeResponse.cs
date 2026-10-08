namespace Nails.Application.Modules.Identity.Responses;

public sealed record MeResponse(Guid Id, string Email, string DisplayName);
