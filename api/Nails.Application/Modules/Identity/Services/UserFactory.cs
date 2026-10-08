using Microsoft.AspNetCore.Identity;
using Nails.Application.Common.Tenancy;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Identity.Services;

public sealed class UserFactory(
    UserManager<ApplicationUser> users,
    ITenantRepository tenants,
    IUnitOfWork unitOfWork,
    TenantContext tenantContext,
    TimeProvider clock)
{
    public async Task<ApplicationUser> CreateAsync(string name, string phone, CancellationToken cancellationToken)
    {
        var tenant = new Tenant { Id = Guid.CreateVersion7(), Name = name };
        var user = new ApplicationUser
        {
            Id = Guid.CreateVersion7(),
            TenantId = tenant.Id,
            UserName = phone,
            PhoneNumber = phone,
            PhoneNumberConfirmed = true,
            DisplayName = name,
            Role = TenantRole.Owner,
            CreatedAt = clock.GetUtcNow()
        };

        await unitOfWork.InTransactionAsync(async token =>
        {
            tenants.Add(tenant);
            await unitOfWork.SaveChangesAsync(token);
            tenantContext.Set(tenant.Id);

            var result = await users.CreateAsync(user);

            if (!result.Succeeded)
            {
                throw IdentityErrors.From(result);
            }
        }, cancellationToken);

        return user;
    }
}
