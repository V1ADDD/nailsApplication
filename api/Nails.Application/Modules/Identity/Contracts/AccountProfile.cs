namespace Nails.Application.Modules.Identity.Contracts;

public sealed record AccountProfile(string Name, string Phone, string? Email, string? PhotoUrl, string? Telegram, string? Viber);
