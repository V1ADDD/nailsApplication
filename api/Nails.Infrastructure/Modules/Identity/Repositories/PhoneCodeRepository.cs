using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Identity.Repositories;

public sealed class PhoneCodeRepository(AppDbContext dbContext) : IPhoneCodeRepository
{
    public Task<PhoneCode?> FindAsync(string phone, CancellationToken cancellationToken) =>
        dbContext.Set<PhoneCode>().FirstOrDefaultAsync(code => code.Phone == phone, cancellationToken);

    public void Add(PhoneCode code) => dbContext.Set<PhoneCode>().Add(code);

    public void Remove(PhoneCode code) => dbContext.Set<PhoneCode>().Remove(code);
}
