namespace Nails.Infrastructure.Storage.Contracts;

public interface IFileStorage
{
    Task SaveAsync(string key, Stream content, CancellationToken cancellationToken);

    Stream OpenRead(string key);
}
