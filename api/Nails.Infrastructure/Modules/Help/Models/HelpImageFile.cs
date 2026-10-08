namespace Nails.Infrastructure.Modules.Help.Models;

public sealed record HelpImageFile(string FullPath, string ContentType, long Length, int Width, int Height, string Version);
