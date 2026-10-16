using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Nails.Infrastructure.Options;
using Nails.Infrastructure.Storage.Contracts;

namespace Nails.Infrastructure.Storage;

public sealed class LocalFileStorage(IOptions<StorageOptions> options, IHostEnvironment environment) : IFileStorage
{
    private const int BufferSize = 81920;

    private readonly string _root = Path.GetFullPath(Path.Combine(environment.ContentRootPath, options.Value.RootPath));

    public async Task SaveAsync(string key, Stream content, CancellationToken cancellationToken)
    {
        var path = PathOf(key);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);

        await using var file = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None, BufferSize, useAsync: true);
        await content.CopyToAsync(file, cancellationToken);
    }

    public Stream OpenRead(string key) =>
        new FileStream(PathOf(key), FileMode.Open, FileAccess.Read, FileShare.Read, BufferSize, useAsync: true);

    private string PathOf(string key)
    {
        var path = Path.GetFullPath(Path.Combine(_root, key));

        return path.StartsWith(_root + Path.DirectorySeparatorChar, StringComparison.Ordinal)
            ? path
            : throw new InvalidOperationException("Storage key escapes the storage root.");
    }
}
