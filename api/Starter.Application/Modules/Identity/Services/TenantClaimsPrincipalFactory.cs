using System.Globalization;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Starter.Application.Modules.Identity.Models;
using Starter.Infrastructure.Modules.Identity.Entities;

namespace Starter.Application.Modules.Identity.Services;

public sealed class TenantClaimsPrincipalFactory(UserManager<ApplicationUser> userManager, IOptions<IdentityOptions> options)
    : UserClaimsPrincipalFactory<ApplicationUser>(userManager, options)
{
    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
    {
        var identity = await base.GenerateClaimsAsync(user);
        identity.AddClaim(new Claim(IdentityClaimTypes.TenantId, user.TenantId.ToString("D", CultureInfo.InvariantCulture)));
        identity.AddClaim(new Claim(Options.ClaimsIdentity.RoleClaimType, user.Role.ToString()));
        return identity;
    }
}
