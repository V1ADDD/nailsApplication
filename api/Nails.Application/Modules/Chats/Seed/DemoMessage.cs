using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Seed;

public sealed record DemoMessage(MessageKind Kind, ChatRole? Author, int MinutesAgo, string? Text = null);
