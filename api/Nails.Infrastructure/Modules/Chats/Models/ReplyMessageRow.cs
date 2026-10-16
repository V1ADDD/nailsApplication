using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Infrastructure.Modules.Chats.Models;

public sealed record ReplyMessageRow(Guid ChatId, ChatRole AuthorRole, DateTimeOffset SentAt);
