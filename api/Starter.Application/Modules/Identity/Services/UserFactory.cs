using Microsoft.AspNetCore.Identity;
using Starter.Infrastructure.Modules.Identity.Entities;

namespace Starter.Application.Modules.Identity.Services;

public sealed class UserFactory(UserManager<ApplicationUser> users, TimeProvider clock)
{
    public async Task<ApplicationUser> CreateOwnerAsync(Tenant tenant, string email, string displayName, string password, bool emailConfirmed)
    {
        var user = new ApplicationUser
        {
            Id = Guid.CreateVersion7(),
            TenantId = tenant.Id,
            UserName = email.Trim(),
            Email = email.Trim(),
            EmailConfirmed = emailConfirmed,
            DisplayName = displayName.Trim(),
            Role = TenantRole.Owner,
            CreatedAt = clock.GetUtcNow()
        };

        var result = await users.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            throw IdentityErrors.From(result);
        }

        return user;
    }
}
