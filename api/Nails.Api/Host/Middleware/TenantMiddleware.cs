using System.Security.Claims;
using Nails.Application.Common.Tenancy;
using Nails.Application.Modules.Identity.Models;
using Nails.Application.Modules.Identity.Services;

namespace Nails.Api.Host.Middleware;

public sealed class TenantMiddleware(RequestDelegate next)
{
    public Task InvokeAsync(HttpContext context, TenantContext tenantContext, CurrentUser currentUser)
    {
        var user = context.User;

        if (user.Identity?.IsAuthenticated == true
            && Guid.TryParse(user.FindFirstValue(IdentityClaimTypes.TenantId), out var tenantId)
            && Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            tenantContext.Set(tenantId);
            currentUser.Set(userId);
        }

        return next(context);
    }
}
