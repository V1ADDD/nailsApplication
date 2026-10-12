namespace Nails.Application.Modules.Identity.Contracts;

public interface IAccountDirectory
{
    Task<IReadOnlyDictionary<Guid, string>> NamesAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken);
}
