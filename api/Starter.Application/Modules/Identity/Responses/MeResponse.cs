using Starter.Infrastructure.Modules.Identity.Entities;

namespace Starter.Application.Modules.Identity.Responses;

public sealed record MeResponse(Guid Id, string Email, string DisplayName, TenantRole Role, Guid TenantId, string TenantName);
