namespace Nails.Application.Modules.Identity.Seed;

public sealed record DemoAccount(string Slug, string Name, string Phone, string? MasterSlug, bool Online);
