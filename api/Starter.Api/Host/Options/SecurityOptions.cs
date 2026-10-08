namespace Starter.Api.Host.Options;

public sealed class SecurityOptions
{
    public const string SectionName = "Security";

    public bool RedirectToHttps { get; set; }

    public bool SecureCookies { get; set; }

    public ForwardedHeadersSettings ForwardedHeaders { get; set; } = new();
}
