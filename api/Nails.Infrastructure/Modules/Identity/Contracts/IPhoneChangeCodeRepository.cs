using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Infrastructure.Modules.Identity.Contracts;

public interface IPhoneChangeCodeRepository
{
    Task<PhoneChangeCode?> FindAsync(Guid userId, CancellationToken cancellationToken);

    void Add(PhoneChangeCode code);

    void Remove(PhoneChangeCode code);
}
