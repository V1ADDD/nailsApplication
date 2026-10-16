namespace Nails.Application.Modules.Chats.Seed;

public sealed record DemoChat(
    string MasterSlug,
    string ClientSlug,
    IReadOnlyList<DemoMessage> Messages,
    int? ClientReadMinutesAgo = null,
    int? MasterReadMinutesAgo = null);
