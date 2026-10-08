using Starter.Infrastructure.Persistence.Contracts;

namespace Starter.Application.Common.Tenancy;

public sealed class TenantContext : ITenantProvider
{
    public Guid TenantId { get; private set; }

    public void Set(Guid tenantId)
    {
        TenantId = tenantId;
    }
}
