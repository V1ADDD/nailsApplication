using Nails.Application.Modules.Identity.Contracts;
using Nails.Infrastructure.Modules.Identity.Contracts;

namespace Nails.Application.Modules.Identity.Services;

public sealed class AccountDirectory(IAccountDirectoryRepository accounts) : IAccountDirectory
{
    public Task<IReadOnlyDictionary<Guid, string>> NamesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken) =>
        accounts.NamesAsync([.. userIds.Distinct()], cancellationToken);

    public Task<IReadOnlyDictionary<Guid, string>> PhonesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken) =>
        accounts.PhonesAsync([.. userIds.Distinct()], cancellationToken);

    public async Task<AccountProfile?> ProfileAsync(Guid userId, CancellationToken cancellationToken) =>
        await accounts.FindAsync(userId, cancellationToken) is { PhoneNumber: { } phone } user
            ? new AccountProfile(user.DisplayName, phone, user.Email, user.PhotoUrl, user.Telegram, user.Viber)
            : null;
}
