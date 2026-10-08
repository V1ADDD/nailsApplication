namespace Nails.Api.Host.Options;

public sealed class ForwardedHeadersSettings
{
    public bool Enabled { get; set; }

    public string[] KnownProxies { get; set; } = [];

    public string[] KnownNetworks { get; set; } = [];
}
