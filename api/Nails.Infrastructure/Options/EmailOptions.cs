using System.ComponentModel.DataAnnotations;
using MailKit.Security;

namespace Nails.Infrastructure.Options;

public sealed class EmailOptions
{
    public const string SectionName = "Email";

    [Required]
    [EmailAddress]
    public string FromAddress { get; set; } = string.Empty;

    [Required]
    public string FromName { get; set; } = string.Empty;

    [Required]
    public string Host { get; set; } = string.Empty;

    [Range(1, 65535)]
    public int Port { get; set; }

    public SecureSocketOptions Security { get; set; } = SecureSocketOptions.StartTls;

    public string UserName { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
