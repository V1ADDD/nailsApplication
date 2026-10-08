namespace Nails.Infrastructure.Modules.Help.Models;

public sealed record HelpDocument(string Module, IReadOnlyList<HelpSectionDocument>? Sections);
