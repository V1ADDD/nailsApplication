namespace Nails.Application.Common.Media;

public sealed record MediaContent(string ContentType, string ETag, Stream Content);
