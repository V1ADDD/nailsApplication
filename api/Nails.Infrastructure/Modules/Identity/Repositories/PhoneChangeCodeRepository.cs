using Microsoft.EntityFrameworkCore;
using Nails.Infrastructure.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Identity.Repositories;

public sealed class PhoneChangeCodeRepository(AppDbContext dbContext) : IPhoneChangeCodeRepository
{
    public Task<PhoneChangeCode?> FindAsync(Guid userId, CancellationToken cancellationToken) =>
        dbContext.Set<PhoneChangeCode>().FirstOrDefaultAsync(code => code.UserId == userId, cancellationToken);

    public void Add(PhoneChangeCode code) => dbContext.Set<PhoneChangeCode>().Add(code);

    public void Remove(PhoneChangeCode code) => dbContext.Set<PhoneChangeCode>().Remove(code);
}
