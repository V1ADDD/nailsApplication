using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Identity.Seed;

public sealed class IdentityDemoSeeder(AppDbContext dbContext, TimeProvider clock) : IDemoSeeder
{
    private const string TenantPrefix = "tenant:";
    private static readonly TimeSpan OnlineFor = TimeSpan.FromDays(365);

    public int Order => 10;

    public async Task ResetAsync(CancellationToken cancellationToken)
    {
        var userIds = IdentityDemoData.Accounts.Select(account => DemoIds.User(account.Slug)).ToList();
        var tenantIds = IdentityDemoData.Accounts.Select(account => TenantId(account.Slug)).ToList();
        await dbContext.Set<ApplicationUser>().Where(user => userIds.Contains(user.Id)).ExecuteDeleteAsync(cancellationToken);
        await dbContext.Set<Tenant>().Where(tenant => tenantIds.Contains(tenant.Id)).ExecuteDeleteAsync(cancellationToken);
    }

    public async Task SeedAsync(CancellationToken cancellationToken)
    {
        var userIds = IdentityDemoData.Accounts.Select(account => DemoIds.User(account.Slug)).ToList();

        if (await dbContext.Set<ApplicationUser>().AnyAsync(user => userIds.Contains(user.Id), cancellationToken))
        {
            return;
        }

        await RemovePhoneHoldersAsync(cancellationToken);

        var now = clock.GetUtcNow();

        foreach (var account in IdentityDemoData.Accounts)
        {
            var tenantId = TenantId(account.Slug);
            dbContext.Set<Tenant>().Add(new Tenant { Id = tenantId, Name = account.Name });
            dbContext.Set<ApplicationUser>().Add(new ApplicationUser
            {
                Id = DemoIds.User(account.Slug),
                TenantId = tenantId,
                UserName = account.Phone,
                NormalizedUserName = account.Phone,
                PhoneNumber = account.Phone,
                PhoneNumberConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString("N"),
                ConcurrencyStamp = Guid.NewGuid().ToString("N"),
                DisplayName = account.Name,
                Role = TenantRole.Owner,
                CreatedAt = now,
                LastSeenAt = account.Online ? now + OnlineFor : null,
                MasterId = account.MasterSlug is { } master ? DemoIds.For(master) : null
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task RemovePhoneHoldersAsync(CancellationToken cancellationToken)
    {
        var phones = IdentityDemoData.Accounts.Select(account => account.Phone).ToList();
        var holders = dbContext.Set<ApplicationUser>().Where(user => user.PhoneNumber != null && phones.Contains(user.PhoneNumber));
        var tenantIds = await holders.Select(user => user.TenantId).ToListAsync(cancellationToken);
        await holders.ExecuteDeleteAsync(cancellationToken);
        await dbContext.Set<Tenant>()
            .Where(tenant => tenantIds.Contains(tenant.Id) && !dbContext.Set<ApplicationUser>().Any(user => user.TenantId == tenant.Id))
            .ExecuteDeleteAsync(cancellationToken);
    }

    private static Guid TenantId(string slug) => DemoIds.For(TenantPrefix + slug);
}
