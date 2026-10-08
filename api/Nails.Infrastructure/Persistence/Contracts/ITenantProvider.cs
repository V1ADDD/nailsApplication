namespace Nails.Infrastructure.Persistence.Contracts;

public interface ITenantProvider
{
    Guid TenantId { get; }
}
