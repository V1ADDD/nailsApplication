namespace Starter.Infrastructure.Persistence.Contracts;

public interface ITenantProvider
{
    Guid TenantId { get; }
}
