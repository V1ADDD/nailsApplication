namespace Starter.Infrastructure.Persistence.Contracts;

public interface ITenantEntity
{
    Guid TenantId { get; set; }
}
