using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Nails.Application.Common.Tenancy;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Identity.Options;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Identity.Services;

public sealed partial class IdentityBootstrapper(
    ITenantRepository tenants,
    UserFactory userFactory,
    IUnitOfWork unitOfWork,
    TenantContext tenantContext,
    IOptions<BootstrapOptions> options,
    ILogger<IdentityBootstrapper> logger) : IIdentityBootstrapper
{
    public async Task RunAsync(CancellationToken cancellationToken)
    {
        var bootstrap = options.Value;

        if (!bootstrap.Enabled || await tenants.AnyAsync(cancellationToken))
        {
            return;
        }

        var tenant = new Tenant { Id = Guid.CreateVersion7(), Name = bootstrap.TenantName };

        await unitOfWork.InTransactionAsync(async token =>
        {
            tenants.Add(tenant);
            await unitOfWork.SaveChangesAsync(token);
            tenantContext.Set(tenant.Id);
            await userFactory.CreateOwnerAsync(tenant, bootstrap.OwnerEmail, bootstrap.OwnerDisplayName, bootstrap.OwnerPassword, emailConfirmed: true);
        }, cancellationToken);

        LogCreated(logger, tenant.Id);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Created the first tenant {TenantId} and its owner.")]
    private static partial void LogCreated(ILogger logger, Guid tenantId);
}
