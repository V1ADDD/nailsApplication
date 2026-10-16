namespace Nails.Application.Modules.Masters.Contracts;

public sealed record MasterSummary(Guid Id, Guid UserId, string Name, string? PhotoUrl, string Specialty, bool Online, bool Deleted);
