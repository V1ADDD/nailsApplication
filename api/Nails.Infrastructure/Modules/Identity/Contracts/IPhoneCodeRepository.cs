using Nails.Infrastructure.Modules.Identity.Entities;

namespace Nails.Infrastructure.Modules.Identity.Contracts;

public interface IPhoneCodeRepository
{
    Task<PhoneCode?> FindAsync(string phone, CancellationToken cancellationToken);

    void Add(PhoneCode code);

    void Remove(PhoneCode code);
}
